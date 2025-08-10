import { request } from '@/utils/apiClient';
import { CreateCategoryRequest, UpdateCategoryRequest, Category } from '@/modules/Category/interfaces/Category';

export class CategoryService {
  static async createCategory(data: CreateCategoryRequest): Promise<Category> {
    try {
      return await request('/categories', {
        method: 'POST',
        data,
      });
    } catch (error) {
      console.error('Failed to create category:', error);
      throw new Error('카테고리 생성에 실패했습니다.');
    }
  }

  static async getAllCategories(): Promise<Category[]> {
    try {
      return await request('/categories');
    } catch (error) {
      console.error('Failed to get all categories:', error);
      throw new Error('모든 카테고리를 가져오는데 실패했습니다.');
    }
  }

  static async getRootCategories(): Promise<Category[]> {
    try {
      return await request('/categories/root');
    } catch (error) {
      console.error('Failed to get root categories:', error);
      throw new Error('최상위 카테고리를 가져오는데 실패했습니다.');
    }
  }

  static async getCategoryChildren(id: number): Promise<Category[]> {
    try {
      return await request(`/categories/${id}/children`);
    } catch (error) {
      console.error(`Failed to get children for category ${id}:`, error);
      throw new Error(`카테고리 ${id}의 하위 카테고리를 가져오는데 실패했습니다.`);
    }
  }

  static async getCategoryById(id: number): Promise<Category> {
    try {
      return await request(`/categories/${id}`);
    } catch (error) {
      console.error(`Failed to get category by ID ${id}:`, error);
      throw new Error(`ID ${id}의 카테고리를 가져오는데 실패했습니다.`);
    }
  }

  static async updateCategory(id: number, data: UpdateCategoryRequest): Promise<Category> {
    try {
      return await request(`/categories/${id}`, {
        method: 'PUT',
        data,
      });
    } catch (error) {
      console.error(`Failed to update category ${id}:`, error);
      throw new Error(`카테고리 ${id}를 업데이트하는데 실패했습니다.`);
    }
  }

  static async deleteCategory(id: number): Promise<{ message: string }> {
    try {
      const response = await request<{ message: string }>(`/categories/${id}`, {
        method: 'DELETE',
      });
      return { message: response.message };
    } catch (error) {
      console.error(`Failed to delete category ${id}:`, error);
      throw new Error(`카테고리 ${id}를 삭제하는데 실패했습니다.`);
    }
  }
}