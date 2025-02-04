const User = require('../models/userDataModel');
const TitlesModel = require('../models/titleModel');
const { generateTitlesWithAgent } = require('../services/titleGenerationAgent');

exports.createTitlesForUser = async (req, res) => {
    try {
        const { clerkRef, customTitles, updateCustomOnly, selectedIds = [] } = req.body;
        
        let titleDoc = await TitlesModel.findOne({ clerkRef });
        let user = await User.findOne({ clerkRef });

        if (!titleDoc) {
            titleDoc = new TitlesModel({
                clerkRef,
                categories: [],
                customTitles: []
            });
        }

        // Handle custom titles update
        if (updateCustomOnly && customTitles) {
            const transformedCustom = customTitles.map(t => ({ title: t, selected: false }));
            const customCategoryIndex = titleDoc.categories.findIndex(
                cat => cat.name === 'Custom'
            );

            if (customCategoryIndex !== -1) {
                titleDoc.categories[customCategoryIndex].titles = transformedCustom;
            } else {
                titleDoc.categories.push({
                    name: 'Custom',
                    titles: transformedCustom
                });
            }
        } 
        else if (user && (!titleDoc.categories.length || titleDoc.categories.every(cat => cat.name === 'Custom'))) {
            try {
                const userInfo = {
                    niche: user.niche,
                    linkedinAudience: user.linkedinAudience,
                    narative: user.narative
                };

                const generatedTitles = await generateTitlesWithAgent(userInfo);
                
                // Merge AI-generated categories with existing custom titles
                const transformed = generatedTitles.categories.map(cat => ({
                    name: cat.name,
                    titles: cat.titles.map(titleStr => ({ title: titleStr, selected: false }))
                }));
                const customCategory = titleDoc.categories.find(cat => cat.name === 'Custom');
                titleDoc.categories = transformed;
                
                if (customCategory) {
                    titleDoc.categories.push(customCategory);
                }
                
                titleDoc.generationStage = false;
            } catch (genError) {
                console.error('Title generation error:', genError);
                return res.status(500).json({
                    success: false,
                    error: 'Failed to generate AI titles'
                });
            }
        }

        // After handling customTitles or AI generation, update selected titles using provided selectedIds
        if (Array.isArray(selectedIds)) {
            titleDoc.categories.forEach(category => {
                category.titles.forEach(t => {
                    t.selected = selectedIds.includes(t._id.toString());
                });
            });
        }

        titleDoc.lastUpdated = new Date();
        await titleDoc.save();

        res.json({
            success: true,
            categories: titleDoc.categories,
            customTitles: titleDoc.customTitles
        });
        
    } catch (error) {
        console.error('Error in createTitlesForUser:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
};

exports.getTitlesForUser = async (req, res) => {
  try {
    const { clerkRef } = req.query;
    if (!clerkRef) {
      return res.status(400).json({ success: false, error: 'Missing clerkRef in query.' });
    }

    const titleDoc = await TitlesModel.findOne({ clerkRef });
    if (!titleDoc) {
      return res.status(404).json({ success: false, error: 'No titles found for this user.' });
    }

    return res.json({
      success: true,
      categories: titleDoc.categories,
      customTitles: titleDoc.customTitles
    });
  } catch (error) {
    console.error('Error fetching titles:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
