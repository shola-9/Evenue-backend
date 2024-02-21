import express, { Request, Response } from "express";
import pool from "../../db/db";
import { RowDataPacket } from "mysql2";

export const getVenue: express.RequestHandler = (
  req: Request,
  res: Response
) => {
  const { venue_id } = req.params;
  console.log(venue_id ?? "no venue_id");

  if (!venue_id) {
    res.status(400).json({ error: "Missing venue_id" });
    return;
  }

  try {
    // check if the Venue exists in the database. Avoid race condition

    pool.execute<RowDataPacket[]>(
      `
        SELECT
            v.id, v.title, v.description, v.category, v.select_type, v.bathrooms, v.toilets, v.starting_price, v.location, v.no_of_guest, v.space_preference, GROUP_CONCAT(vimg.imgs) AS imgs
        FROM venues v
        JOIN venue_imgs vimg ON v.id = vimg.fk_venue_id
        WHERE v.id = ?
        GROUP BY v.id 
        ORDER BY v.id DESC;
                `,
      [venue_id],
      (err, result) => {
        if (err) {
          console.error(err);
          res.status(500).json({ error: "Internal server error" });
          return;
        } else if (result.length === 0) {
          res.status(404).json({ error: "Venue not found" });
          return;
        } else {
          console.log(result);

          res.status(200).json({ result });
        }
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
