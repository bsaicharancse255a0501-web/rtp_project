import * as cheerio from 'cheerio';
import axios from 'axios';

async function run() {
  const { data } = await axios.get("https://docs.x.ai/docs/models");
  const $ = cheerio.load(data);
  console.log($('body').text().replace(/\s+/g, ' '));
}

run();
