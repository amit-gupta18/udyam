import express from 'express';
// import { scrapeForm } from './scrape.js';
import { scrapeStep1Form } from './scrape.js';

const app = express();
const port = 3000;

console.log("hello typescript!");
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


async function fetchFormSchema() {
  try {
    const formSchema = await scrapeStep1Form();
    console.log(JSON.stringify(formSchema, null, 2));
  } catch (error) {
    console.error("Error fetching form schema:", error);
  }
}

fetchFormSchema(); 