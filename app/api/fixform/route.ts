import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'components', 'BookingForm.tsx');
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace vertical spacing in form
    content = content.replace(/className="p-4 sm:p-6 space-y-4"/g, 'className="p-4 sm:p-5 space-y-3"');

    // Replace header padding
    content = content.replace(/p-4 sm:p-6 rounded-t-3xl/g, 'p-3 sm:p-4 rounded-t-3xl');

    // Replace label margins
    content = content.replace(/mb-1\.5/g, 'mb-1');
    content = content.replace(/mb-2/g, 'mb-1');

    // Replace input heights
    content = content.replace(/min-h-\[48px\]/g, 'min-h-[42px]');
    content = content.replace(/py-3/g, 'py-2');

    // Replace button heights
    content = content.replace(/min-h-\[44px\]/g, 'min-h-[40px]');
    content = content.replace(/py-2\.5/g, 'py-2');
    content = content.replace(/min-h-\[52px\]/g, 'min-h-[46px]');
    content = content.replace(/py-3\.5 sm:py-4/g, 'py-2.5 sm:py-3');

    // Replace textarea rows
    content = content.replace(/rows=\{3\}/g, 'rows={2}');

    fs.writeFileSync(filePath, content, 'utf8');
    
    return NextResponse.json({ success: true, message: 'Updated BookingForm.tsx' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
