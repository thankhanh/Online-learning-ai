const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const Material = require('../models/Material');

const fixFiles = async () => {
    try {
        console.log('⏳ Connecting to Database...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB.');

        const materials = await Material.find({});
        console.log(`🔍 Checking ${materials.length} materials...`);

        const uploadDir = path.join(__dirname, '../../uploads/materials');

        for (const mat of materials) {
            const oldUrl = mat.fileUrl;
            // Extract filename from /uploads/materials/filename
            const filename = path.basename(oldUrl);
            
            // Check if filename has special characters (excluding dot and hyphen usually safe, but let's be strict)
            if (/[^a-zA-Z0-9.-]/.test(filename)) {
                console.log(`⚠️ Found problematic filename: "${filename}"`);
                
                const sanitizedName = filename.replace(/[^a-zA-Z0-9.]/g, '_');
                const newUrl = oldUrl.replace(filename, sanitizedName);
                
                const oldPath = path.join(uploadDir, filename);
                const newPath = path.join(uploadDir, sanitizedName);

                if (fs.existsSync(oldPath)) {
                    console.log(`🔄 Renaming file on disk: ${filename} -> ${sanitizedName}`);
                    fs.renameSync(oldPath, newPath);
                } else {
                    console.log(`❌ File not found on disk: ${oldPath}`);
                }

                console.log(`📝 Updating DB: ${oldUrl} -> ${newUrl}`);
                mat.fileUrl = newUrl;
                await mat.save();
            }
        }

        console.log('✨ File fix completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error fixing files:', error);
        process.exit(1);
    }
};

fixFiles();
