import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Home from '../pages/index';

// Basic mock for fetch used in analyze + generate flows
const mockFetch = jest.fn((input: RequestInfo) => {
  const url = typeof input === 'string' ? input : input.url;
  if (url.startsWith('/api/analyze')) {
    return Promise.resolve(new Response(JSON.stringify({
      storeName: 'TestStore',
      title: 'Test Product',
      product: true
    }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
  }
  if (url.startsWith('/api/generate')) {
    return Promise.resolve(new Response(JSON.stringify({
      products: [
        {
          title: 'Generated Product',
          url: 'https://example.com/product/1',
          price: '$10',
          description: 'Desc',
          metadataDescription: 'Desc',
          originalMetadataDescription: 'Desc',
          descriptionP: 'Desc P',
          descriptionUl: '<ul><li>Feat</li></ul>',
          descSource: 'metadata',
          image: 'https://example.com/img.jpg',
          images: ['https://example.com/img.jpg']
        }
      ],
      html: ''
    }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
  }
  return Promise.resolve(new Response('{}', { status: 200 }));
}) as any;

describe('resetAllState integration', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    // @ts-ignore
    global.fetch = mockFetch;
  });

  it('prompts for URL, creates section after submit, and returns to prompt after reset', async () => {
    render(<Home />);

    // Initial prompt present
    const input = screen.getByPlaceholderText('https://yourstore.com/products/example');
    fireEvent.change(input, { target: { value: 'https://example.com/products/test' } });
    fireEvent.submit(input.closest('form')!);

    // Wait for auto body section creation (product title appears in summary right panel)
    await waitFor(() => expect(mockFetch).toHaveBeenCalled());

    // Open the speed dial -> click Build New EDM -> confirm
    // Speed dial appears only in preview mode after brandWebsite set; wait for the action button
    // Use aria-label from code: "Build New EDM"
    // First open the speed dial by clicking the main fab (aria-label="Preview quick actions")
    const fab = await screen.findByLabelText('Preview quick actions');
    fireEvent.click(fab);
    const buildNew = await screen.findByLabelText('Build New EDM');
    fireEvent.click(buildNew);

    const confirm = await screen.findByRole('button', { name: /confirm reset/i });
    fireEvent.click(confirm);

    // Should return to landing prompt (brandWebsite cleared)
    await waitFor(() => {
      expect(screen.getByPlaceholderText('https://yourstore.com/products/example')).toBeInTheDocument();
    });
  });
});
