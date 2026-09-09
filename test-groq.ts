import axios from 'axios';

async function test() {
  try {
    const res = await axios.get('https://api.groq.com/openai/v1/models', {
      headers: {
        Authorization: 'Bearer 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'
      }
    });
    console.log(res.data.data.map((m: any) => m.id));
  } catch (e: any) {
    console.error(e.response?.data || e.message);
  }
}

test();
