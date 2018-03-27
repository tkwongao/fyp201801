//
CREATE TABLE public.initial_guess as select y Y1, x X1 FROM
    base_location_results WHERE x IS NOT NULL AND y IS NOT NULL;

CREATE or replace function sqr_euclid_dis(
  tot float, num float, meantot float, meannum float
  ) returns float as $$
BEGIN
  return (tot-meantot)*(tot-meantot)+(num-meannum)*(num-meannum);
END
$$ language plpgsql;

WITH(iter, tot1, num1, tot2, num2) as (
  select 1, *
  from 
    initial_guess
  union all
  select
    kmeans.iter + 1
    , (
      select avg(y)
      from ( 
        select 
          s.y
          , s.x
        from ( 
          select
            y
            , x
            , case when sqr_euclid_dis(
                y, x
                , kmeans.tot1, kmeans.num1) < 
                  sqr_euclid_dis(y
                  , x, kmeans.tot2, kmeans.num2)
                then 1
                else 2
              end as cluster_id
          from 
            base_location_results
        ) s
        where cluster_id = 1
      ) l
    )
    , ( 
      select avg(x)
      from ( 
        select 
          s.y
          , s.x
        from ( 
          select y
            , x
            , case when sqr_euclid_dis(
                y, x
                , kmeans.tot1, kmeans.num1) < 
                  sqr_euclid_dis(y
                  , x, kmeans.tot2, kmeans.num2)
                then 1
                else 2
              end as cluster_id
          from
            base_location_results
        ) s
        where cluster_id = 1
      ) l
    )
    , ( 
      select avg(y)
      from ( 
        select 
          t.y
          , t.x
        from ( 
          select 
            y
            , x
            , case when sqr_euclid_dis(
                y, x
                , kmeans.tot1, kmeans.num1) < 
                  sqr_euclid_dis(y
                  , x, kmeans.tot2, kmeans.num2)
                then 1
                else 2
              end as cluster_id
          from
            base_location_results
        ) t
        where cluster_id = 2
      ) m
    )
    , ( 
      select avg(x)
      from ( 
        select 
          t.y
          , t.x
        from ( 
          select 
            y
            , x
            , case when sqr_euclid_dis(
                y, x
                , kmeans.tot1, kmeans.num1) < 
                  sqr_euclid_dis(y
                  , x, kmeans.tot2, kmeans.num2)
                then 1
                else 2
              end as cluster_id
          from
            base_location_results
        ) t
        where cluster_id = 2
      ) m
    )
  from
    kmeans
  where kmeans.iter < 10
);

select
  base_location_results.*
  , case when sqr_euclid_dis(y
        , x, kmeans.tot1
        , kmeans.num1) < sqr_euclid_dis(
          y, x
        , kmeans.tot2, kmeans.num2)
      then 1
      else 2
  end as cluster_id
from
  base_location_results
  , kmeans
where iter = 10;
