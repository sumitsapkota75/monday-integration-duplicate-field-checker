const router = require('express').Router();
const initMondayClient = require('monday-sdk-js');
const mondayRoutes = require('./monday');
const mondayService = require('../services/monday-service');
const checkDuplicateService = require('../services/duplicate-service');

router.use(mondayRoutes);

router.get('/', function (req, res) {
  res.json(getHealth());
});

router.post('/hitserver', function (req, res) {
  console.log('Payload', req.body);
  console.log('Done...');
  res.sendStatus(200);
});

router.post('/check-duplicate', async function (req, res) {
  const { payload } = req.body;
  const { inputFields } = payload;
  const { boardId } = inputFields;

  const newColumnValue = req.body.payload.inputFields.columnValue;
  const column = Object.keys(newColumnValue)[0];
  // fetch all the column value for specific columns (like phone)
  const allData = await mondayService.getColumnValues(boardId, column);

  // check for duplicate field value in the mentioned column -> phone
  const duplicateItemsID = checkDuplicateService.CheckDuplicateFieldValue(allData);
  if (duplicateItemsID.length > 0) {
    // create or get group
    // try to get group named 'duplicate' if exist
    const duplicateGroupID = await mondayService.getOrCreateDuplicateGroup(boardId);

    // if exists, move item to the new board and change status to Duplicate
    const move_item_to_group = await mondayService.moveToNewGroup(duplicateItemsID, duplicateGroupID, boardId);
  }

  res.sendStatus(200);
});

router.get('/health', function (req, res) {
  res.json(getHealth());
  res.end();
});

function getHealth() {
  return {
    ok: true,
    message: 'Healthy',
  };
}

module.exports = router;
