import { Category, CategoryMeta } from '../types';

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  paper: {
    id: 'paper',
    name: '纸类',
    description: '纸箱、报纸、书籍、办公用纸',
    icon: 'FileText',
  },
  plastic: {
    id: 'plastic',
    name: '塑料',
    description: '饮料瓶、塑料容器、塑料包装',
    icon: 'Recycle',
  },
  metal: {
    id: 'metal',
    name: '金属',
    description: '易拉罐、金属罐、小型金属制品',
    icon: 'Package',
  },
  fabric: {
    id: 'fabric',
    name: '织物',
    description: '旧衣物、布料、床上用品',
    icon: 'Shirt',
  },
};

export const CATEGORY_LIST: CategoryMeta[] = Object.values(CATEGORY_META);
