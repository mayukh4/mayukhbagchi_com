import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const pdfPath = path.join(process.cwd(), 'public', 'cv', 'mayukh_bagchi_cv.pdf');
    const pdfBuffer = await readFile(pdfPath);

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="mayukh_bagchi_cv.pdf"',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Frame-Options': 'SAMEORIGIN',
      },
    });
  } catch (error) {
    console.error('Error serving PDF:', error);
    return NextResponse.json({ error: 'PDF not found' }, { status: 404 });
  }
}
