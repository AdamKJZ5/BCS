const fs = require('fs');
const path = require('path');

const filesToFix = [
  'src/controllers/invoiceController.ts',
  'src/controllers/leadAdminController.ts',
  'src/controllers/leadController.ts',
  'src/controllers/paymentController.ts',
  'src/jobs/appointmentReminders.ts',
  'src/middlewares/errorHandler.ts',
  'src/utils/createNotification.ts',
  'src/utils/sms.ts'
];

filesToFix.forEach(file => {
  const filePath = path.join(__dirname, file);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${file}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Check if file already has logger import
  if (content.includes('import logger from') || content.includes("import logger from")) {
    console.log(`✅ ${file} already has logger import`);
    return;
  }

  // Check if file imports from logger (might be importing loggers)
  const hasLoggersImport = content.includes('from "../utils/logger"') || content.includes('from "../../utils/logger"') || content.includes('from \'../utils/logger\'');

  if (hasLoggersImport) {
    console.log(`✅ ${file} already imports from logger module`);
    return;
  }

  // Add import statement after the first import block
  const lines = content.split('\n');
  let insertIndex = 0;

  // Find the last import statement
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('import ')) {
      insertIndex = i + 1;
    } else if (insertIndex > 0 && lines[i].trim() !== '') {
      break;
    }
  }

  const importStatement = file.includes('jobs/') || file.includes('middlewares/')
    ? 'import logger from "../utils/logger";'
    : 'import logger from "../utils/logger";';

  lines.splice(insertIndex, 0, importStatement);

  const newContent = lines.join('\n');
  fs.writeFileSync(filePath, newContent, 'utf8');

  console.log(`✅ Added logger import to ${file}`);
});

console.log('\n✅ Done fixing logger imports!');
