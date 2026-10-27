import request from './request';

export const fetchAllCategoryRequest = () => {
  return request.get('/api/products');
};

// Phase A / A13: products of the product type with this stable code (e.g. MEM), session tenant.
export const fetchCategoryByTypeCode = typeCode => {
  return request.get(`/api/products/by-type-code/${encodeURIComponent(typeCode)}`);
};

export const fetchCategoryByCategoryId = (categoryId) => {
  return request.get(`/api/products/${categoryId}`);
};
