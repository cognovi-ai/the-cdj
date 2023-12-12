export const createAnalysis = async (req, res, next) => {
  const { newEntry } = req.body;

  analyzeEntry(newEntry)
    .then(analysisResult => {
      notifyClient(newEntry._id, analysisResult);
    })
    .catch(err => {
      notifyClient(newEntry._id, err);
    });
};
