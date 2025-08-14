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
    const formSchema = await scrapeStep1Form();
    console.log(formSchema);
}
fetchFormSchema();
//# sourceMappingURL=index.js.map