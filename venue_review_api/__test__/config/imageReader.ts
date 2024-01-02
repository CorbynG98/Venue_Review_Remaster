import fs from 'fs';
import path from 'path';

export function readTestImage() {
    return fs.readFileSync(path.join(__dirname, './resources/test-image.png'));
}