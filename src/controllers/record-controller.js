const initMondayClient = require('monday-sdk-js');

async function updateRecordInDB(req, res) {
  try {
    const { payload } = req.body;
    const { inputFields } = payload;
    const { boardId, itemId } = inputFields;
    const mondayClient = initMondayClient();
    mondayClient.setToken(process.env.API_ACCESS_TOKEN);
    const query = `query ($boardId: ID!) {
        me {
          name
        }
        boards(ids: [$boardId]) {
          name
          id
          items_page(limit: 100) {
            items {
              id
              name
              column_values(ids: ["phone","email"]) {
                value
              }
            }
          }
        }
      }`;
    const variables = { boardId };
    const response = await mondayClient.api(query, { variables });
    if (response.errors) {
      console.log('Errors', response.errors);
      return
    }
    console.log(response.data.boards[0].items_page.items);
    const recordData = response.data.boards[0].items_page.items
    recordData.map((item)=>{
        console.log("Each column:",item.column_values)
    })
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: 'internal server error' });
  }
}

module.exports = {
  updateRecordInDB,
};
