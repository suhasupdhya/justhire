
// @ts-ignore
import { PDFParse } from 'pdf-parse';
import fs from 'fs';

async function test() {
    try {
        console.log('Testing PDFParse import...');
        console.log('PDFParse type:', typeof PDFParse);

        if (typeof PDFParse !== 'function') {
            console.error('PDFParse is not a constructor/class!');
            return;
        }

        // Create a dummy buffer (not a valid PDF, but enough to test instantiation if it doesn't validate immediately)
        // Actually, let's just check instantiation.
        console.log('Instantiating PDFParse...');
        // We can't really parse invalid data, but we can check if it crashes on instantiation.
        // Or we just try to parse a text file and expect a specific error, not "is not a function".

        const dummyBuffer = Buffer.from('%PDF-1.4\n%...');
        const parser = new PDFParse({ data: dummyBuffer });
        console.log('Parser instantiated successfully.');

        // Don't call getText() on dummy data if it might crash with parse error. 
        // We just want to ensure "pdf is not a function" is gone.

        await parser.destroy();
        console.log('Parser destroyed.');

    } catch (error) {
        console.error('Error:', error);
    }
}

test();
