import { useState } from 'react';
import { useServiceStore } from '../../store/serviceStore';
import { useInventoryStore } from '../../store/inventoryStore';
import { PageHeader, Card } from '../../components/Layout/PageHeader';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { Service, ServiceCategory, ServiceCategoryMap, ServiceDuration } from '../../types';
import { formatDuration } from '../../utils/date';
import { Plus, Clock, Scissors, Package, X } from 'lucide-react';

const categories: ServiceCategory[] = ['facial', 'body', 'nail', 'hair_removal'];

export function Services() {
  const { services, addService, deleteService } = useServiceStore();
  const products = useInventoryStore(s => s.products);
  const [showNewModal, setShowNewModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState<ServiceCategory | 'all'>('all');

  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<ServiceCategory>('facial');
  const [newDuration, setNewDuration] = useState<ServiceDuration>(60);
  const [newPrice, setNewPrice] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<{ productId: string; quantity: number }[]>([]);

  const filteredServices = activeCategory === 'all' 
    ? services 
    : services.filter(s => s.category === activeCategory);

  const handleAddProduct = () => {
    setSelectedProducts([...selectedProducts, { productId: products[0]?.id || '', quantity: 1 }]);
  };

  const handleRemoveProduct = (index: number) => {
    setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
  };

  const handleUpdateProduct = (index: number, field: 'productId' | 'quantity', value: string | number) => {
    const updated = [...selectedProducts];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedProducts(updated);
  };

  const handleSubmit = () => {
    if (!newName.trim() || !newPrice) return;
    addService({
      name: newName.trim(),
      category: newCategory,
      duration: newDuration,
      price: Number(newPrice),
      description: newDescription.trim(),
      products: selectedProducts.filter(p => p.productId && p.quantity > 0),
    });
    setShowNewModal(false);
    resetForm();
  };

  const resetForm = () => {
    setNewName('');
    setNewCategory('facial');
    setNewDuration(60);
    setNewPrice('');
    setNewDescription('');
    setSelectedProducts([]);
  };

  return (
    <div>
      <PageHeader 
        title="服务项目"
        description="管理美容服务项目和关联产品"
        actions={
          <Button onClick={() => setShowNewModal(true)} icon={<Plus className="w-4 h-4" />}>
            添加项目
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeCategory === 'all'
              ? 'bg-gradient-to-r from-rose-400 to-rose-500 text-white shadow-soft'
              : 'bg-white text-brown-600 hover:bg-cream-50 border border-rose-100'
          }`}
        >
          全部
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeCategory === cat
                ? 'bg-gradient-to-r from-rose-400 to-rose-500 text-white shadow-soft'
                : 'bg-white text-brown-600 hover:bg-cream-50 border border-rose-100'
            }`}
          >
            {ServiceCategoryMap[cat]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.map((service, idx) => (
          <Card 
            key={service.id} 
            className="opacity-0 animate-fade-in-up"
            style={{ animationDelay: `${idx * 0.05}s`, animationFillMode: 'forwards' }}
          >
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-100 to-gold-100 flex items-center justify-center">
                      <Scissors className="w-4 h-4 text-rose-500" />
                    </div>
                    <h3 className="font-serif font-semibold text-lg text-brown-700">{service.name}</h3>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-cream-100 text-brown-500">
                    {ServiceCategoryMap[service.category]}
                  </span>
                </div>
                <p className="font-serif text-2xl font-bold text-rose-500">¥{service.price}</p>
              </div>

              {service.description && (
                <p className="text-sm text-brown-500 mb-4">{service.description}</p>
              )}

              <div className="flex items-center gap-4 text-sm text-brown-500 mb-4">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-rose-400" />
                  {formatDuration(service.duration)}
                </div>
              </div>

              {service.products.length > 0 && (
                <div className="pt-4 border-t border-rose-50">
                  <p className="text-xs text-brown-400 mb-2 flex items-center gap-1">
                    <Package className="w-3.5 h-3.5" />
                    消耗产品
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {service.products.map((sp, i) => {
                      const product = products.find(p => p.id === sp.productId);
                      return product ? (
                        <span key={i} className="text-xs px-2 py-1 rounded-lg bg-cream-50 text-brown-600">
                          {product.name} × {sp.quantity}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      <Modal
        open={showNewModal}
        onClose={() => { setShowNewModal(false); resetForm(); }}
        title="添加服务项目"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setShowNewModal(false); resetForm(); }}>取消</Button>
            <Button onClick={handleSubmit} disabled={!newName.trim() || !newPrice}>确认添加</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-brown-600 mb-2">项目名称 *</label>
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="请输入项目名称"
              className="w-full px-4 py-2.5 rounded-xl border border-rose-100 bg-cream-50 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-brown-600 mb-2">项目分类</label>
              <select
                value={newCategory}
                onChange={e => setNewCategory(e.target.value as ServiceCategory)}
                className="w-full px-4 py-2.5 rounded-xl border border-rose-100 bg-cream-50 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{ServiceCategoryMap[cat]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-brown-600 mb-2">服务时长</label>
              <div className="grid grid-cols-3 gap-2">
                {[30, 60, 90].map(d => (
                  <button
                    key={d}
                    onClick={() => setNewDuration(d as ServiceDuration)}
                    className={`py-2.5 rounded-xl text-sm font-medium transition-all ${
                      newDuration === d
                        ? 'bg-gradient-to-r from-rose-400 to-rose-500 text-white'
                        : 'bg-cream-50 text-brown-600 hover:bg-cream-100'
                    }`}
                  >
                    {d}分钟
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-brown-600 mb-2">服务价格 *</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brown-400">¥</span>
              <input
                type="number"
                value={newPrice}
                onChange={e => setNewPrice(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-rose-100 bg-cream-50 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-brown-600 mb-2">项目描述</label>
            <textarea
              value={newDescription}
              onChange={e => setNewDescription(e.target.value)}
              placeholder="请输入项目描述"
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-rose-100 bg-cream-50 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all resize-none"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-brown-600 flex items-center gap-1">
                <Package className="w-4 h-4 text-rose-400" /> 关联消耗产品
              </label>
              <Button size="sm" variant="ghost" onClick={handleAddProduct}>+ 添加</Button>
            </div>
            <div className="space-y-2">
              {selectedProducts.length === 0 ? (
                <p className="text-sm text-brown-400 text-center py-4 bg-cream-50 rounded-xl">暂未添加产品</p>
              ) : (
                selectedProducts.map((sp, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <select
                      value={sp.productId}
                      onChange={e => handleUpdateProduct(idx, 'productId', e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border border-rose-100 bg-cream-50 focus:outline-none text-sm"
                    >
                      <option value="">选择产品</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={sp.quantity}
                      onChange={e => handleUpdateProduct(idx, 'quantity', Number(e.target.value))}
                      placeholder="数量"
                      className="w-20 px-3 py-2 rounded-lg border border-rose-100 bg-cream-50 focus:outline-none text-sm"
                    />
                    <button onClick={() => handleRemoveProduct(idx)} className="p-2 text-brown-400 hover:text-rose-500">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
