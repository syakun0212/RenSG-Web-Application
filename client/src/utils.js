import axios from "./axios";

const dict = {
  "ANG MO KIO": 221.00733276174975,
  BEDOK: 178.950997831084,
  BISHAN: 360.47986570014245,
  "BUKIT BATOK": 106.33516761048588,
  "BUKIT MERAH": 518.2836437479148,
  "BUKIT PANJANG": -51.20959931367491,
  "BUKIT TIMAH": 372.607556904717,
  CENTRAL: 644.3174370063756,
  "CHOA CHU KANG": -64.50867786231616,
  CLEMENTI: 391.3284499331841,
  GEYLANG: 269.53644513985796,
  HOUGANG: 64.64565301270322,
  "JURONG EAST": 202.18910606007327,
  "JURONG WEST": 122.94763754007357,
  "KALLANG/WHAMPOA": 398.81871643533276,
  "MARINE PARADE": 302.29241242425417,
  "PASIR RIS": 49.127435564917036,
  QUEENSTOWN: 475.01403326204513,
  SEMBAWANG: -84.94841640866963,
  SENGKANG: -6.57484678881093,
  SERANGOON: 248.2590896392583,
  TAMPINES: 172.14636369812857,
  "TOA PAYOH": 310.88332138087395,
  WOODLANDS: -60.14787480816099,
  YISHUN: 30.016623608146304,
  2: 480.25322250420277,
  3: 886.5222197653277,
  4: 1309.5644228289436,
  5: 1455.8284846207048,
  EXECUTIVE: 1561.2790059563783,
};

const b = 733.84482383;

// export function getRecommendation(location, room) {
//   const res = Math.round(
//     b +
//       (location.toUpperCase in dict ? dict[location.toUpperCase()] : 0) +
//       (room in dict ? dict[room] : 0)
//   );
//   console.log(res, typeof(res));
//   return Math.round(
//     b +
//       (location.toUpperCase in dict ? dict[location.toUpperCase()] : 0) +
//       (room in dict ? dict[room] : 0)
//   );
// }

// export async function getRecommendation (location, room) {
//   const finalData = {
//     'town':location.toUpperCase ,
//     'room': room.toUpperCase,
//   };
//   var value = 999
//   console.log(value, typeof(value));
//   try {
//     const res = await axios.post("/api/model", finalData, {
//       withCredentials: true,
//     });
    
//     // value = parseFloat(res);
//     console.log('HERE!');
//     console.log(value);
//     return value;
//   } catch (error) {
//     console.error(error);
//   }
// };


// date is an ISOString with zero UTC offset
export function formatTimeAgo(date) {
  const formatter = new Intl.RelativeTimeFormat(undefined, {
    numeric: "auto",
  });

  const DIVISIONS = [
    { amount: 60, name: "seconds" },
    { amount: 60, name: "minutes" },
    { amount: 24, name: "hours" },
    { amount: 7, name: "days" },
    { amount: 4.34524, name: "weeks" },
    { amount: 12, name: "months" },
    { amount: Number.POSITIVE_INFINITY, name: "years" },
  ];
  //account for timezone offset (GMT+8)
  let duration = (new Date(date) - new Date() + 8 * 60 * 60 * 1000) / 1000;

  for (let i = 0; i < DIVISIONS.length; i++) {
    const division = DIVISIONS[i];
    if (Math.abs(duration) < division.amount) {
      return formatter.format(Math.round(duration), division.name);
    }
    duration /= division.amount;
  }
}
