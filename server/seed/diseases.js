import Disease from '../models/Disease.js';

export const diseaseSeed = [
  {
    cropName: 'Tomato', name: 'Early blight',
    symptoms: ['Small dark spots can enlarge into concentric target-like lesions.', 'Older leaves may yellow and drop early.'],
    prevention: ['Use clean planting material.', 'Improve airflow and avoid prolonged leaf wetness.', 'Remove badly affected plant debris.'],
    management: ['Remove affected leaves where practical.', 'Use locally approved fungicide only according to the product label and agricultural guidance.']
  },
  {
    cropName: 'Tomato', name: 'Late blight',
    symptoms: ['Dark, water-soaked lesions may appear on leaves.', 'Under humid conditions lesions can expand rapidly.'],
    prevention: ['Use healthy seedlings.', 'Avoid overhead irrigation and improve field ventilation.'],
    management: ['Remove severely affected material.', 'Follow local agricultural recommendations for registered disease-control products.']
  },
  {
    cropName: 'Tomato', name: 'Bacterial spot',
    symptoms: ['Small dark spots on leaves, stems or fruit.', 'Severe infection can cause leaf yellowing and drop.'],
    prevention: ['Use certified or clean seed and transplants.', 'Avoid handling plants while foliage is wet.'],
    management: ['Remove heavily infected debris and follow local extension guidance for management options.']
  },
  {
    cropName: 'Potato', name: 'Early blight',
    symptoms: ['Brown lesions with concentric rings on older leaves.', 'Affected leaves may yellow and die prematurely.'],
    prevention: ['Rotate crops where feasible.', 'Maintain balanced nutrition and avoid plant stress.'],
    management: ['Remove infected debris and use locally approved fungicide programs when recommended.']
  },
  {
    cropName: 'Potato', name: 'Late blight',
    symptoms: ['Irregular dark lesions on leaves and stems.', 'White growth may occur on leaf undersides in humid conditions.'],
    prevention: ['Use healthy seed tubers.', 'Avoid extended leaf wetness and monitor during cool, humid weather.'],
    management: ['Remove severely affected plants and follow local agricultural advisory recommendations.']
  },
  {
    cropName: 'Apple', name: 'Apple scab',
    symptoms: ['Olive to dark lesions can appear on leaves and fruit.', 'Fruit may develop scabby cork-like patches.'],
    prevention: ['Remove fallen infected leaves where practical.', 'Maintain orchard sanitation and airflow.'],
    management: ['Use an integrated disease-management program recommended for the local orchard.']
  },
  {
    cropName: 'Grape', name: 'Black rot',
    symptoms: ['Brown circular leaf lesions may develop.', 'Fruit can shrivel and form dark mummified berries.'],
    prevention: ['Remove mummified fruit and infected debris.', 'Maintain canopy airflow.'],
    management: ['Use locally registered control measures according to agricultural recommendations.']
  },
  {
    cropName: 'Corn (maize)', name: 'Common rust',
    symptoms: ['Small reddish-brown rust pustules occur on leaves.', 'Severe infection can reduce green leaf area.'],
    prevention: ['Grow locally recommended resistant varieties where available.', 'Maintain balanced crop nutrition.'],
    management: ['Monitor disease development and follow local extension recommendations.']
  },
  {
    cropName: 'Peach', name: 'Bacterial spot',
    symptoms: ['Small dark lesions can occur on leaves and fruit.', 'Severe leaf infection may cause premature defoliation.'],
    prevention: ['Use healthy planting material and maintain orchard sanitation.', 'Avoid unnecessary leaf wetting.'],
    management: ['Follow local horticultural recommendations for integrated management.']
  },
  {
    cropName: 'Cherry (including sour)', name: 'Powdery mildew',
    symptoms: ['White powdery fungal growth can cover young leaves and shoots.', 'New growth may become distorted.'],
    prevention: ['Maintain good airflow and avoid excessive nitrogen.', 'Prune appropriately for canopy ventilation.'],
    management: ['Use locally approved treatments according to label directions and local advice.']
  },
  {
    cropName: 'Pepper, bell', name: 'Bacterial spot',
    symptoms: ['Small water-soaked or dark spots on leaves.', 'Fruit may develop raised or scabby lesions.'],
    prevention: ['Use pathogen-free seed/transplants and avoid overhead irrigation.', 'Sanitize tools and remove crop debris.'],
    management: ['Use integrated management practices recommended for the growing region.']
  },
  {
    cropName: 'Strawberry', name: 'Leaf scorch',
    symptoms: ['Purple to reddish lesions may appear on leaflets.', 'Lesions can merge and give leaves a scorched appearance.'],
    prevention: ['Remove infected debris and maintain good plant spacing.', 'Use healthy planting material.'],
    management: ['Follow local extension guidance for disease management.']
  }
];
