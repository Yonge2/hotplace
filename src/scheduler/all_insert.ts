import axios from "axios";
import db from "../db/models/index";
import { env } from "../env";

export const allInsertDB = async () => {
  try {
    //업종명

    const getHeadUrl =
      "https://openapi.gg.go.kr/GENRESTRT" +
      "?key=" +
      env.API_KEY +
      "&type=json&pSize=5&pindex=1";

    const getHead = await axios.get(getHeadUrl);
    const headData = getHead.data;

    // 데이터 총 개수
    // const total = headData.GENRESTRT[0].head[0].list_total_count;
    const total = 2000;
    // 한번에 가져올 데이터 수
    const chunkSize = 100;
    var cnt = 0;
    for (let idx = 1; idx < total; idx += chunkSize) {
      console.log(idx, "번째 요청");
      const url =
        "https://openapi.gg.go.kr/GENRESTRT" +
        "?key=" +
        env.API_KEY +
        "&type=json&pSize=" +
        chunkSize +
        "&pindex=" +
        Math.floor(idx / chunkSize + 1);
      console.log("url : ", url);

      // 전체 데이터 가져오기
      const response = await axios.get(url);
      const responseData = response.data;
      const restaurants = responseData.GENRESTRT[1].row;

      for (let i in restaurants) {
        if (restaurants[i].BSN_STATE_NM == "폐업") {
          // 폐업 가게수
          // cnt++;
        } else {
          const restaurantInfo = {
            restaurant_name: restaurants[i].BIZPLC_NM,
            restaurant_type: restaurants[i].SANITTN_BIZCOND_NM,
            adress: restaurants[i].REFINE_LOTNO_ADDR, // 도로명 주소가 없는 식당이 존재 함
            lat: Number(restaurants[i].REFINE_WGS84_LAT),
            lon: Number(restaurants[i].REFINE_WGS84_LOGT),
          };
          const insertDB = await db.Restaurant.create(restaurantInfo);
        }
      }
    }
    // console.log("폐업 가게 수 : ", cnt);
  } catch (error) {
    console.log("api 호출 중 오류 발생 : ", error);
  }
};
