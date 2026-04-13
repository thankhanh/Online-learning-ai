const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Material = require('../models/Material');

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function fixMaterials() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const result = await Material.updateMany(
            { fileUrl: { $exists: false } }, 
            { $set: { fileUrl: 'sample_document.pdf' } }
        );
        console.log(`Updated ${result.modifiedCount} materials.`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

fixMaterials();
