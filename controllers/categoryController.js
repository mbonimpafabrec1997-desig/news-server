export const getCategories = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      categories: [],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category: {
        name,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};