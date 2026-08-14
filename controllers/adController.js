import Ad from "../models/Ad.js";

export const createAd = async (req, res) => {
  try {
    const { businessName, email, duration, description } = req.body;
    let bannerPath = "";

    if (req.files && req.files.banner) {
      const banner   = req.files.banner;
      const fileName = `${Date.now()}_${banner.name}`;
      bannerPath     = `/uploads/${fileName}`;
      await banner.mv(`./uploads/${fileName}`);
    }

    const newAd = new Ad({
      businessName,
      email,
      duration,
      description,
      banner:  bannerPath,
      status: "active", 
    });

    await newAd.save();
    res.status(201).json({ success: true, message: "Ad created successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAds = async (req, res) => {
  try {
    const ads = await Ad.find({ status: "active" }).sort({ createdAt: -1 });
    
    const formattedAds = ads.map(ad => {
      const bannerUrl = ad.banner 
        ? (ad.banner.startsWith("http") ? ad.banner : `${req.protocol}://${req.get("host")}${ad.banner.startsWith("/") ? "" : "/"}${ad.banner}`) 
        : "";
      return {
        ...ad.toObject(),
        image: bannerUrl,
        title: ad.businessName || "Sponsored Ad",
        banner: bannerUrl
      };
    });

    res.status(200).json({ success: true, ads: formattedAds });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteAd = async (req, res) => {
  try {
    const { id } = req.params;
    const ad = await Ad.findByIdAndDelete(id);
    if (!ad) {
      return res.status(404).json({ success: false, message: "Ad not found" });
    }
    res.status(200).json({ success: true, message: "Ad deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};