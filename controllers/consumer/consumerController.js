import Consumer from "../../modules/consumer/Consumer.js";


export const getConsumers = async (req, res) => {
  try {
    const {
      page,
      limit,
      search = "",
      isVerified,
    } = req.body;

    const skip = (page - 1) * limit;

    // 🔍 Build filter
    const filter = {};

    if (search && search.trim() !== "") {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { mobile: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }

    if (isVerified !== undefined) {
      filter.isVerified = isVerified;
    }

    // 📥 Fetch consumers
    const consumers = await Consumer.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select(
        "name mobile location selfie dob lat lon isVerified createdAt"
      );

    // 🔢 Total count
    const total = await Consumer.countDocuments(filter);

    return res.json({
      success: true,
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit),
      data: consumers,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
