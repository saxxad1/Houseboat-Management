import { getEffectiveSeasonalData } from './lib/admin/publicData';
import { getSeasonalData } from './data/seasonalData';

const testContent = [
  {
    "id": "66d9ce78-96f9-432e-8437-d0177d03397e",
    "section_key": "packages",
    "title": "Tour Packages",
    "subtitle": "Choose from our carefully crafted itineraries for the perfect getaway.",
    "content": null,
    "image_url": null,
    "button_text": null,
    "button_url": null,
    "is_active": false
  }
];

const sd = getEffectiveSeasonalData(getSeasonalData('haor'), null, testContent, 'haor');
console.log(sd.packagesSection);
