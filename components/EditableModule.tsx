import React from 'react';
import { uniqueImages } from '../lib/imageUtils';
import { ProductData } from '../lib/types';

interface EditableModuleProps {
  product: ProductData;
  index: number;
  orientation: 'left-image' | 'right-image';
  /**
   * Update a single field on the product. The parent component
   * owns the full array of products and will re-render the code
   * when updates occur. The field must be one of the keys on
   * ProductData. When updating the image the value should be a
   * complete URL from the product.images array.
   */
  updateProduct: (index: number, field: keyof ProductData, value: string) => void;
}

const EditableModule: React.FC<EditableModuleProps> = ({
  product,
  index,
  orientation,
  updateProduct
}) => {
  // Determine whether to reverse the flex order based on orientation.
  const isReverse = orientation === 'right-image';

  // Popup state for selecting an alternate image. When true the
  // selector modal is rendered over the page. The component uses
  // local state to manage visibility because multiple modules can be
  // open independently.
  const [showSelector, setShowSelector] = React.useState(false);

  // Handler to open the selector. The onClick is attached to both
  // the image itself and a small edit icon overlay. When invoked
  // the modal becomes visible.
  const openSelector = () => {
    if (product.images && product.images.length > 0) {
      setShowSelector(true);
    }
  };

  // Handler for picking an alternative image. It updates the
  // product image via the parent callback then closes the modal.
  const selectImage = (src: string) => {
    updateProduct(index, 'image', src);
    setShowSelector(false);
  };

  return (
    <div className={`module${isReverse ? ' reverse' : ''}`}>
      {/* Image column */}
      <div
        className={`image${product.images && product.images.length > 0 ? ' selectable' : ''}`}
        onClick={openSelector}
      >
        <img src={product.image} alt={product.title} />
        {/* Edit icon overlay */}
        {product.images && product.images.length > 0 && (
          <div className="edit-icon" onClick={(e) => { e.stopPropagation(); openSelector(); }}>
            {/* Simple pencil SVG icon */}
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M14.69 3.1l6.2 6.2c.27.27.27.7 0 .97l-8.2 8.2c-.17.17-.39.26-.62.26H6.5c-.55 0-1-.45-1-1v-5.57c0-.23.09-.45.26-.62l8.2-8.2c.27-.27.7-.27.97 0zM5 20h14v2H5v-2z" />
            </svg>
          </div>
        )}
      </div>
      {/* Text column */}
      <div className="content">
        {/* Title */}
          <div
            className="title"
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => {
              const text = e.currentTarget.innerText.replace(/\n$/, '');
              updateProduct(index, 'title', text);
            }}
          >
            {product.title || 'Product title'}
          </div>
        {/* Price: show original price if available (non‑editable) and sale price editable */}
        <div className="price">
          {product.originalPrice && (
            <span className="original-price">
              {'$' + product.originalPrice}
            </span>
          )}
          <span
            className="sale-price"
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => {
              const value = e.currentTarget.innerText.replace(/\$/g, '').trim();
              updateProduct(index, 'price', value);
            }}
          >
            {product.price ? '$' + product.price : 'Price'}
          </span>
        </div>
        {/* Description */}
          <div
            className="description"
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => {
              const text = e.currentTarget.innerText.replace(/\n$/, '');
              const html = text.replace(/\n/g, '<br>');
              updateProduct(index, 'description', html);
            }}
            dangerouslySetInnerHTML={{ __html: product.description || 'Description' }}
          />
        <div className="cta-row">
          <a
            href={product.cta || product.url}
            className="button"
            target="_blank"
            rel="noopener noreferrer"
          >
            SHOP NOW
          </a>
        </div>
      </div>
      {/* Image selector modal */}
      {showSelector && product.images && product.images.length > 0 && (
        <div className="image-selector-overlay" onClick={() => setShowSelector(false)}>
          <div className="image-selector" onClick={(e) => e.stopPropagation()}>
            {/*
              Deduplicate images by base path (strip query parameters). Shopify and
              other e‑commerce platforms often serve the same image with
              different query strings for size or format. Using a Map ensures
              that only one instance of each base URL is shown. The current
              selected image is highlighted with a border.
            */}
            {/*
              Build a unique list of images by stripping query parameters from
              each URL. This avoids showing duplicates where Shopify uses
              different size or format parameters. We also preserve order.
            */}
            {uniqueImages(product.images || []).map((img, i) => {
              const isSelected = img === product.image;
              return (
                <img
                  key={i}
                  src={img}
                  alt=""
                  onClick={() => selectImage(img)}
                  className={isSelected ? 'selected' : undefined}
                />
              );
            })}
            <button onClick={() => setShowSelector(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditableModule;
