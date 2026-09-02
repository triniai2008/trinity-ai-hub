// Idempotent seeding of the Trini AI syllabus into Turso.
import { turso } from "@/integrations/turso/client.server";
import { SYLLABUS } from "./syllabus";

export async function seedLearnContent(): Promise<void> {
  const db = turso();

  for (const [si, s] of SYLLABUS.entries()) {
    await db.execute({
      sql: `INSERT INTO subjects (id, code, name, description, stream, order_no)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              code = excluded.code, name = excluded.name,
              description = excluded.description, order_no = excluded.order_no`,
      args: [s.slug, s.code, s.name, s.description, s.stream, si],
    });

    for (const [ui, u] of s.units.entries()) {
      await db.execute({
        sql: `INSERT INTO units (id, subject_id, order_no, title, summary)
              VALUES (?, ?, ?, ?, ?)
              ON CONFLICT(id) DO UPDATE SET
                title = excluded.title, summary = excluded.summary, order_no = excluded.order_no`,
        args: [u.slug, s.slug, ui, u.title, u.summary],
      });

      for (const [li, l] of u.lessons.entries()) {
        await db.execute({
          sql: `INSERT INTO lessons (id, unit_id, subject_id, order_no, title, outcomes)
                VALUES (?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                  title = excluded.title, outcomes = excluded.outcomes, order_no = excluded.order_no`,
          args: [l.slug, u.slug, s.slug, li, l.title, JSON.stringify(l.outcomes)],
        });

        for (const [ti, t] of l.topics.entries()) {
          await db.execute({
            sql: `INSERT INTO topics (id, lesson_id, subject_id, order_no, title, body_md, definitions, formulas, practicals)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                  ON CONFLICT(id) DO UPDATE SET
                    title = excluded.title, body_md = excluded.body_md,
                    definitions = excluded.definitions, formulas = excluded.formulas,
                    practicals = excluded.practicals, order_no = excluded.order_no`,
            args: [
              t.slug,
              l.slug,
              s.slug,
              ti,
              t.title,
              t.body,
              JSON.stringify(t.definitions ?? []),
              JSON.stringify(t.formulas ?? []),
              JSON.stringify(t.practicals ?? []),
            ],
          });

          for (const [qi, q] of t.quizzes.entries()) {
            await db.execute({
              sql: `INSERT INTO quizzes (id, topic_id, subject_id, kind, question, options, answer, explanation, difficulty)
                    VALUES (?, ?, ?, 'mcq', ?, ?, ?, ?, ?)
                    ON CONFLICT(id) DO UPDATE SET
                      question = excluded.question, options = excluded.options,
                      answer = excluded.answer, explanation = excluded.explanation,
                      difficulty = excluded.difficulty`,
              args: [
                `${t.slug}-q${qi + 1}`,
                t.slug,
                s.slug,
                q.q,
                JSON.stringify(q.options),
                q.answer,
                q.explanation ?? null,
                q.difficulty ?? 2,
              ],
            });
          }

          for (const [ci, c] of t.cards.entries()) {
            await db.execute({
              sql: `INSERT INTO flashcards (id, topic_id, subject_id, front, back)
                    VALUES (?, ?, ?, ?, ?)
                    ON CONFLICT(id) DO UPDATE SET front = excluded.front, back = excluded.back`,
              args: [`${t.slug}-c${ci + 1}`, t.slug, s.slug, c.front, c.back],
            });
          }
        }
      }
    }

    for (const p of s.pastPapers) {
      await db.execute({
        sql: `INSERT INTO past_papers (id, subject_id, year, paper, url) VALUES (?, ?, ?, ?, ?)
              ON CONFLICT(id) DO UPDATE SET url = excluded.url`,
        args: [`${s.slug}-${p.year}-${p.paper.slice(0, 8).replace(/\W+/g, "")}`, s.slug, p.year, p.paper, p.url],
      });
    }
    for (const [mi, m] of s.modelPapers.entries()) {
      await db.execute({
        sql: `INSERT INTO model_papers (id, subject_id, title, url) VALUES (?, ?, ?, ?)
              ON CONFLICT(id) DO UPDATE SET title = excluded.title, url = excluded.url`,
        args: [`${s.slug}-model-${mi + 1}`, s.slug, m.title, m.url],
      });
    }
  }
}
