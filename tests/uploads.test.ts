import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeFile } from '../lib/care';
test('PDF uploads are rejected, including PDFs disguised as images', async () => {
  const bytes = '%PDF-1.7\nPDF uploads are disabled';
  await assert.rejects(
    normalizeFile(new File([bytes], 'record.pdf', { type: 'application/pdf' }), false),
    /JPEG, PNG or WebP/,
  );
  await assert.rejects(
    normalizeFile(new File([bytes], 'record.jpg', { type: 'image/jpeg' }), false),
  );
});
