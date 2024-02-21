import express, { Request, Response } from "express";
import pool from "../../db/db";
import multer from "multer";
import { upload } from "../../multer/multer";
import cloudinary from "../../cloudinary/cloudinary";
import getUserIDAndToken from "../users/getUserIdFromToken";
import { ResultSetHeader } from "mysql2";

export const uploadVenue: express.RequestHandler = async (
  req: Request,
  res: Response
) => {
  const { user_id } = getUserIDAndToken(req);

  if (!user_id) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  console.log({ user_id });

  upload.array("imgs", 5)(req, res, async (error) => {
    if (error) {
      // Handle error
      if (error.message === "Unexpected field") {
        console.log(error.message);

        res.status(400).json({ error: "Maximum of 5 images allowed" });
        return;
      }

      console.log(error.message);

      res.status(500).json({ error: error.message });
      return;
    }

    // Handle multer upload error
    if (error instanceof multer.MulterError) {
      // Handle Multer error
      console.log(error.message);

      res.status(500).json({ error: error.message });
      return;
    }

    // Handle no files uploaded
    if (!req.files || req.files.length === 0) {
      // No files uploaded
      console.log(error.message);
      console.error("No files uploaded");

      res.status(400).json({ error: "No files uploaded" });
      return;
    }

    // Handle the case where req.files is not an array
    if (!Array.isArray(req.files)) {
      console.error("req.files is not an array");

      res.status(500).json({ error: "Internal server error" });
      return;
    }

    const {
      title,
      description,
      category,
      furnishing,
      select_type,
      bathrooms,
      toilets,
      starting_price,
      location,
      no_of_guest,
      venue_type,
      space_preference,
    }: {
      title: string;
      description: string;
      category: string;
      furnishing: string;
      select_type: string;
      bathrooms: number;
      toilets: number;
      starting_price: number;
      location: string;
      no_of_guest: number;
      venue_type: string;
      space_preference: number;
    } = req.body;

    // Upload pictures to Cloudinary
    const pictureUrls = Array<string>();

    // Upload each picture to Cloudinary and store the secure URLs
    for (const file of req.files) {
      const uniqueIdentifier =
        Date.now() + "-" + Math.round(Math.random() * 1e9);
      const publicId = `${user_id}_venue_img_${uniqueIdentifier}`;

      const result = await cloudinary.uploader.upload(file.path, {
        public_id: publicId,
      });

      pictureUrls.unshift(result.secure_url);
    }

    pool.getConnection((error, connection) => {
      if (error) {
        // Handle connection error
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
        return;
      } else {
        connection.query("START TRANSACTION;", (error) => {
          if (error) {
            // Handle transaction start error
            res.status(500).json({ error: "Internal server error" });
            return;
          } else {
            try {
              // Insert venue data
              connection.query<ResultSetHeader>(
                "INSERT INTO venues (title, description, category, furnishing, select_type, bathrooms, toilets, starting_price, location, no_of_guest, venue_type, space_preference, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [
                  title,
                  description,
                  category,
                  furnishing,
                  select_type,
                  bathrooms,
                  toilets,
                  starting_price,
                  location,
                  no_of_guest,
                  venue_type,
                  space_preference,
                  user_id,
                ],
                (error, results) => {
                  if (error) {
                    // Handle venue insert error
                    console.error(error);
                    res.status(500).json({ error: "Internal server error" });
                    return;
                  }

                  const fk_venue_id = results.insertId;

                  // Insert image URLs
                  const values = pictureUrls.map((imageUrl) => [
                    fk_venue_id,
                    imageUrl,
                  ]);
                  connection.query(
                    "INSERT INTO venue_imgs (fk_venue_id, imgs) VALUES ?",
                    [values],
                    (error) => {
                      if (error) {
                        // Handle image insert error
                        console.error(error);
                        res
                          .status(500)
                          .json({ error: "Internal server error" });
                        return;
                      }

                      connection.query("COMMIT;", (error) => {
                        if (error) {
                          try {
                            connection.query("ROLLBACK;");
                          } catch (rollbackError) {
                            // Handle rollback error
                            console.error(rollbackError);
                          }
                          res
                            .status(500)
                            .json({ error: "Internal server error" });
                        } else {
                          res
                            .status(200)
                            .json({ message: "Venue created successfully" });
                        }
                      });
                    }
                  );
                }
              );
            } catch (error) {
              connection.query("ROLLBACK;", (rollbackError) => {
                // Handle rollback error
                console.error(rollbackError);
              });
              res.status(500).json({ error: "Internal server error" });
            } finally {
              connection.release(); // Return connection to pool
            }
          }
        });
      }
    });
  });
};
