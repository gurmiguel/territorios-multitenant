-- @param {Int} $1:congregationId The ID of the congregation to filter territories on
-- @param {DateTime} $2:compareDate The date to compare status updates against

SELECT DISTINCT
  t.*,
  CAST(COUNT(h.id) OVER (PARTITION BY t.id) AS INT) as "pendingHouses"
FROM "Territory" t
LEFT JOIN "Street" st ON st."territoryId" = t.id
LEFT JOIN "House" h ON h."streetId" = st.id
LEFT JOIN (
  SELECT DISTINCT ON (su."houseId")
    su."houseId",
    su.date
  FROM "StatusUpdate" su
  ORDER BY su."houseId", su.date DESC
) s ON s."houseId" = h.id AND s.date < $2
WHERE t."congregationId" = $1
ORDER BY t.number ASC