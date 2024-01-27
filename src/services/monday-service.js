const initMondayClient = require('monday-sdk-js');

const getColumnValues = async (boardId, column) => {
  try {
    const mondayClient = initMondayClient();
    mondayClient.setToken(
      'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjMxNDM2MDA0NCwiYWFpIjoxMSwidWlkIjo1NDk5NDY4NSwiaWFkIjoiMjAyNC0wMS0yNVQyMTo0NToxMC4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6MjA5NjUxODYsInJnbiI6InVzZTEifQ.DO5Gfk5r8gCpMQfGfzpnF4BMAX6feGvY6tXT6laZ4Ko'
    );
    const query = `query ($boardId: ID!, $column: String!) {
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
                column_values(ids: [$column]) {
                  id
                  value
                }
              }
            }
          }
        }`;
    const variables = { boardId, column };
    const response = await mondayClient.api(query, { variables });
    if (response.errors) {
      console.log('Errors', response.errors);
    }
    const dataList = response.data.boards.flatMap((board) =>
      board.items_page.items.map((item) => ({
        id: item.id,
        phone: JSON.parse(item.column_values.find((column) => column.id === 'phone').value).phone,
      }))
    );
    return dataList;
  } catch (error) {
    console.error(error);
  }
};

const getOrCreateDuplicateGroup = async (boardID) => {
  try {
    const mondayClient = initMondayClient();
    mondayClient.setToken(
      'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjMxNDM2MDA0NCwiYWFpIjoxMSwidWlkIjo1NDk5NDY4NSwiaWFkIjoiMjAyNC0wMS0yNVQyMTo0NToxMC4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6MjA5NjUxODYsInJnbiI6InVzZTEifQ.DO5Gfk5r8gCpMQfGfzpnF4BMAX6feGvY6tXT6laZ4Ko'
    );
    // get existing groups list in a board
    const getGroupQuery = `query ($boardID: ID!) {
    boards (ids: [$boardID]) {
      groups {
        title
        id
      }
    }
  }`;
    const variables = { boardID };
    const groupResponse = await mondayClient.api(getGroupQuery, { variables });
    const boardListData = groupResponse.data.boards[0].groups;

    // filter Response and get title and ID of group
    const boardList = boardListData.map((item) => {
      return {
        title: item.title,
        id: item.id,
      };
    });

    // check if duplicate group exist and if not create a new group named Duplicates
    // getOrCreateDuplicate Group
    // it will return the ID of group named "Duplicate"
    const duplicatesBoard = boardList.find((board) => board.title.includes('Duplicates'));
    const duplicatesBoardId = duplicatesBoard ? duplicatesBoard.id : null;

    if (duplicatesBoardId) {
      console.log('Group named Duplicates already exists...');
      return duplicatesBoardId;
    } else {
      const query = `mutation ($boardID: ID!) {
              create_group (board_id: $boardID, group_name: "Duplicates") {
                  id
                }
              }`;
      const variables = { boardID };
      const newGroupResponse = await mondayClient.api(query, { variables });
      console.log('New Group named Duplicates was created successfully...');
      return newGroupResponse.data.create_group.id;
    }
  } catch (error) {
    console.log('unexpected error occured: ' + error);
  }
};

const moveToNewGroup = async (duplicateItemsID, duplicateGroupID,boardID) => {
  try {
    const mondayClient = initMondayClient();
    mondayClient.setToken(
      'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjMxNDM2MDA0NCwiYWFpIjoxMSwidWlkIjo1NDk5NDY4NSwiaWFkIjoiMjAyNC0wMS0yNVQyMTo0NToxMC4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6MjA5NjUxODYsInJnbiI6InVzZTEifQ.DO5Gfk5r8gCpMQfGfzpnF4BMAX6feGvY6tXT6laZ4Ko'
    );
    duplicateItemsID.map(async (item) => {
      let itemID = parseInt(item);
      const moveToNewGroupquery = `mutation ($itemID: ID!, $duplicateGroupID: String!) {
        move_item_to_group (item_id: $itemID, group_id: $duplicateGroupID) {
          id
        }
      }`;
      const variables = { itemID, duplicateGroupID };
      const response = await mondayClient.api(moveToNewGroupquery, { variables });
      // and change the status of the duplicate group
      const changeStatusQuery = `mutation ($itemID: ID!, $boardID: ID!) {
        change_simple_column_value (
          board_id: $boardID
          item_id: $itemID,
          column_id: "status",
          create_labels_if_missing: true,
          value: "Duplicate"
          ) {
            id
          }
      }`;
      const changeStatusVariable = { itemID, boardID };
      const changeStatusResponse = await mondayClient.api(changeStatusQuery, {variables: changeStatusVariable});
      console.log("changeStatusResponse", changeStatusResponse)
      return changeStatusResponse;
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  getColumnValues,
  getOrCreateDuplicateGroup,
  moveToNewGroup,
};
