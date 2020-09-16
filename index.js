"use strict";

const axios = require("axios");
const { gameIds } = require("./gameIds");

const { Client } = require("@elastic/elasticsearch");
const client = new Client({
  node: "http://localhost:9200",
});

// install elasticsearch
// (Optional) Create a config file with all relevent ES connection details and plug in to index api request data to ES.
// create developer account at https://developer.sportradar.com/ and insert your NFL api key.
// create ES index with these mappings prior to running the _getStats function.
// PUT gamestats
// {
//   "mappings": {
//     "dynamic_templates": [
//       {
//         "long": {
//           "match": ".*sacks|.*avg_yards|.*players.cmp_pct|.*cmp_pct",
//           "match_pattern": "regex",
//           "mapping": {
//             "type": "long"
//           }
//         }
//       }
//     ]
//   }
// }
// PUT gamestats/_settings
// {
//   "index.mapping.total_fields.limit": 3000
// }

// The request below gets all Game Ids. replace year in request string to specify year you want. All game Ids from 2014  - 2019 are hardcoded in gameIds.js file.

// axios
//   .get(
//     "https://api.sportradar.us/nfl/official/trial/v6/en/games/2014/REG/schedule.json",
//     {
//       params: {
//         api_key: "qqsqz8tdn455z77p7ysvud55",
//       },
//     }
//   )
//   .then(function (response) {
//     // console.log(response.data.weeks);
//     let res = response.data.weeks;
//     _getGames(res);
//   })
//   .catch(function (error) {
//     console.log(error);
//   })
//   .then(function () {
//     // return;
//     // always executed
//   });

// const _getGames = async (weeks) => {
//   let [created, error, exists] = [0, 0, 0];

//   console.log(" | Attempting to create", weeks.length, "weeks...\n |");

//   weeks.map(async (week) => {
//     const { id } = week;
//     const key = `game|${id}`;
//     const game = { ...week };
//     try {
//       await client.index({
//         index: "games",
//         id: key,
//         body: {
//           game,
//         },
//       });

//       const { body } = await client.get({
//         index: "games",
//         id: key,
//       });
//       created++;
//       // console.log(body);
//     } catch (error) {
//       error++;
//     }
//   });

//   console.log(
//     " | savedCount:",
//     created,
//     "| existsCount:",
//     exists,
//     "| otherErrorCount:",
//     error
//   );

//   return true;
// };

// run $ node index.js to run this function and fetch all game statistics using game_ids from gameIds.js file and write to ES index

const _getStats = () => {
  gameIds.map((game_id, i) => {
    setTimeout(() => {
      axios
        .get(
          `https://api.sportradar.us/nfl/official/trial/v6/en/games/${game_id}/statistics.json`,
          {
            params: {
              api_key: "<your_key_here>",
            },
          }
        )
        .then(async function (response) {
          // console.log(response.data.weeks);
          let res = response.data;
          let [created, error, exists] = [0, 0, 0];

          console.log(" | Attempting to create", res.id, "games...\n |");

          // console.log(game);
          const { id } = res;
          const key = `game|${id}`;
          const alert = { ...res };
          // console.log({ alert });
          // try {
          await client.index({
            index: "gamestats",
            id: key,
            body: {
              alert,
            },
          });

          const { body } = await client.get({
            index: "gamestats",
            id: key,
          });
          created++;
          console.log(body);
          // } catch (error) {
          //   error++;
          // }

          console.log(
            " | savedCount:",
            created,
            "| existsCount:",
            exists,
            "| otherErrorCount:",
            error
          );
        })
        .catch(function (error) {
          console.log(error.meta.body.error);
        });
    }, i * 3000);
  });
};

_getStats();
