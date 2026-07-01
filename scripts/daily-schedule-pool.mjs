import {
  DAILY_STRONG_RHYME_CELL_CAP,
  DAILY_TARGET_COUNT,
} from './daily-common.mjs';

export async function getDailySchedulePool(sql) {
  return sql`
    with base as (
      select
        id,
        word,
        pronunciation,
        daily_frequency_rank,
        rhymescore,
        strong_rhyme_key,
        strong_rhyme_cell_size,
        perfect_rhyme_count,
        near_rhyme_count,
        total_usable_rhyme_count,
        (
          least(perfect_rhyme_count, ${DAILY_STRONG_RHYME_CELL_CAP}) * 2
          + near_rhyme_count
          + floor(rhymescore / 1000.0)
        ) as rhymability_score
      from words
      where eligible_for_daily
        and strong_rhyme_key is not null
    ),
    candidates as (
      select
        *,
        row_number() over (
          partition by strong_rhyme_key
          order by rhymability_score desc, daily_frequency_rank nulls last, word
        ) as strong_cell_rank
      from base
    ),
    capped_candidates as (
      select *
      from candidates
      where strong_cell_rank <= ${DAILY_STRONG_RHYME_CELL_CAP}
    ),
    ranked as (
      select
        *,
        row_number() over (
          order by rhymability_score desc, daily_frequency_rank nulls last, word
        ) as schedule_rank
      from capped_candidates
    )
    select *
    from ranked
    where schedule_rank <= ${DAILY_TARGET_COUNT}
    order by schedule_rank
  `;
}
