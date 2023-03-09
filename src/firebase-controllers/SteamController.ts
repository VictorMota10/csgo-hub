import axios from "axios";
import { SEARCH_BY_STEAM_ID } from "../service/config-http";

export const getSteamData = async (steamID: string) => {

  let steamResponse;
  let statusCode;

  await axios
    .get(`${SEARCH_BY_STEAM_ID}${steamID}`)
    .then((res) => {
      steamResponse = res.data;
      statusCode = res.status;
    })
    .catch((error) => {
      console.error(error);
      return null;
    });
  return { steamResponse, statusCode };
};
