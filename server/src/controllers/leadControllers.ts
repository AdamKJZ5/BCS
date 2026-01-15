import { validateLead } from "../validators/leadValidator";

export const createLead = async (req: Request, res: Response) => {
  try {
    const error = validateLead(req.body);
    if (error) {
      return res.status(400).json({ message: error });
    }

    const lead = await Lead.create(req.body);
    await sendLeadEmail(req.body);

    res.status(201).json({ message: "Lead submitted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
