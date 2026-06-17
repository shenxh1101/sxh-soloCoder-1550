import { useState, useMemo } from 'react';
import { useInventoryStore } from '../../store/inventoryStore';
import { useAppointmentStore } from '../../store/appointmentStore';
import { PageHeader, Card } from '../../components/Layout/PageHeader';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { Package, Plus, AlertTriangle, ArrowUpDown, History, TrendingUp, Zap } from 'lucide-react';
import { InventoryLogType, InventoryLogTypeMap } from '../../types';
import { formatDateTime, formatDate } from '../../utils/date';

export function Inventory() {
  const { products, inventoryLogs, addProduct, addInventory, getLowStockProducts, getProductLogs, generateRestockSuggestion, batchRestockLowStock } = useInventoryStore();
  const appointments = useAppointmentStore(s => s.appointments);
  const [showNewProduct, setShowNewProduct] = useState(false);
  const [showStockIn, setShowStockIn] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  
  const [newName, setNewName] = useState('');
  const [newUnit, setNewUnit] = useState('');
  const [newStock, setNewStock] = useState('');
  const [newThreshold, setNewThreshold] = useState('');
  const [newCost, setNewCost] = useState('');

  const [stockInQuantity, setStockInQuantity] = useState('');
  const [stockInRemark, setStockInRemark] = useState('');

  const lowStockProducts = getLowStockProducts();
  
  const selectedProduct = useMemo(() => 
    products.find(p => p.id === selectedProductId), 
    [products, selectedProductId]
  );
  
  const productLogs = useMemo(() => 
    selectedProductId ? getProductLogs(selectedProductId) : [], 
    [selectedProductId, getProductLogs]
  );
  
  const restockSuggestion = useMemo(() => 
    selectedProductId ? generateRestockSuggestion(selectedProductId) : { quantity: 0, reason: '' },
    [selectedProductId, generateRestockSuggestion]
  );

  const handleAddProduct = () => {
    if (!newName.trim() || !newUnit.trim()) return;
    addProduct({
      name: newName.trim(),
      unit: newUnit.trim(),
      stock: Number(newStock) || 0,
      warningThreshold: Number(newThreshold) || 10,
      costPrice: Number(newCost) || 0,
    });
    setShowNewProduct(false);
    resetProductForm();
  };

  const resetProductForm = () => {
    setNewName('');
    setNewUnit('');
    setNewStock('');
    setNewThreshold('');
    setNewCost('');
  };

  const handleStockIn = () => {
    if (!selectedProductId || !stockInQuantity) return;
    addInventory(selectedProductId, Number(stockInQuantity), stockInRemark || '入库');
    setShowStockIn(false);
    setStockInQuantity('');
    setStockInRemark('');
    setSelectedProductId('');
  };

  const openStockIn = (productId?: string) => {
    if (productId) setSelectedProductId(productId);
    setShowStockIn(true);
  };

  const openProductDetail = (productId: string) => {
    setSelectedProductId(productId);
    setShowProductDetail(true);
  };

  const handleBatchRestock = () => {
    if (confirm(`确定为 ${lowStockProducts.length} 件低库存产品按建议量补货吗？`)) {
      batchRestockLowStock();
    }
  };

  const logColors: Record<InventoryLogType, string> = {
    in: 'text-emerald-600 bg-emerald-50',
    out: 'text-rose-600 bg-rose-50',
    consume: 'text-gold-600 bg-gold-50',
  };

  return (
    <div>
      <PageHeader 
        title="库存管理"
        description="管理产品库存和出入库记录"
        actions={
          <>
            <Button variant="secondary" onClick={() => setShowLogs(true)} icon={<History className="w-4 h-4" />}>
              出入库记录
            </Button>
            <Button onClick={() => openStockIn()} icon={<ArrowUpDown className="w-4 h-4" />}>
              产品入库
            </Button>
            <Button onClick={() => setShowNewProduct(true)} icon={<Plus className="w-4 h-4" />}>
              添加产品
            </Button>
          </>
        }
      />

      {lowStockProducts.length > 0 && (
        <Card className="mb-6 p-4 bg-gradient-to-r from-rose-50 to-gold-50 border-rose-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-500 mt-0.5 animate-breathe" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-brown-700">有 {lowStockProducts.length} 件产品库存不足</p>
                <Button size="sm" variant="secondary" onClick={handleBatchRestock} icon={<Zap className="w-3.5 h-3.5" />}>
                  一键补货
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {lowStockProducts.map(p => (
                  <span 
                    key={p.id} 
                    className="text-sm px-3 py-1 rounded-full bg-white/80 text-rose-600 cursor-pointer hover:bg-white transition-colors"
                    onClick={() => openProductDetail(p.id)}
                  >
                    {p.name}：仅剩 {p.stock} {p.unit}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product, idx) => {
          const isLow = product.stock <= product.warningThreshold;
          const percentage = Math.min(100, (product.stock / (product.warningThreshold * 2)) * 100);
          
          return (
            <Card 
              key={product.id} 
              className={`opacity-0 animate-fade-in-up cursor-pointer ${isLow && 'border-rose-300 border-2'}`}
              style={{ animationDelay: `${idx * 0.05}s`, animationFillMode: 'forwards' }}
              onClick={() => openProductDetail(product.id)}
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                      isLow ? 'bg-rose-100' : 'bg-cream-100'
                    }`}>
                      <Package className={`w-5 h-5 ${isLow ? 'text-rose-500' : 'text-rose-400'}`} />
                    </div>
                    <div>
                      <h3 className="font-medium text-brown-700">{product.name}</h3>
                      <p className="text-xs text-brown-400">成本价 ¥{product.costPrice}/{product.unit}</p>
                    </div>
                  </div>
                  {isLow && (
                    <span className="text-xs px-2 py-1 rounded-full bg-rose-100 text-rose-600 animate-breathe">
                      库存不足
                    </span>
                  )}
                </div>

                <div className="mb-3">
                  <div className="flex items-end justify-between mb-2">
                    <span className="text-3xl font-bold font-serif text-brown-700">
                      {product.stock}
                      <span className="text-sm font-normal text-brown-400 ml-1">{product.unit}</span>
                    </span>
                    <span className="text-xs text-brown-400">预警值：{product.warningThreshold} {product.unit}</span>
                  </div>
                  <div className="w-full bg-cream-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full transition-all duration-500 ${
                        isLow 
                          ? 'bg-gradient-to-r from-rose-400 to-rose-500' 
                          : 'bg-gradient-to-r from-rose-300 to-gold-300'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    className="flex-1" 
                    onClick={e => { e.stopPropagation(); openStockIn(product.id); }}
                  >
                    <ArrowUpDown className="w-3.5 h-3.5" />
                    入库
                  </Button>
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    className="flex-1"
                    onClick={e => { e.stopPropagation(); openProductDetail(product.id); }}
                  >
                    <History className="w-3.5 h-3.5" />
                    详情
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Modal
        open={showNewProduct}
        onClose={() => { setShowNewProduct(false); resetProductForm(); }}
        title="添加新产品"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setShowNewProduct(false); resetProductForm(); }}>取消</Button>
            <Button onClick={handleAddProduct} disabled={!newName.trim() || !newUnit.trim()}>确认添加</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-brown-600 mb-2">产品名称 *</label>
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="如：玻尿酸面膜"
              className="w-full px-4 py-2.5 rounded-xl border border-rose-100 bg-cream-50 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-brown-600 mb-2">单位 *</label>
              <input
                type="text"
                value={newUnit}
                onChange={e => setNewUnit(e.target.value)}
                placeholder="如：片、ml、g"
                className="w-full px-4 py-2.5 rounded-xl border border-rose-100 bg-cream-50 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brown-600 mb-2">初始库存</label>
              <input
                type="number"
                value={newStock}
                onChange={e => setNewStock(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-2.5 rounded-xl border border-rose-100 bg-cream-50 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-brown-600 mb-2">预警阈值</label>
              <input
                type="number"
                value={newThreshold}
                onChange={e => setNewThreshold(e.target.value)}
                placeholder="10"
                className="w-full px-4 py-2.5 rounded-xl border border-rose-100 bg-cream-50 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brown-600 mb-2">成本价（元）</label>
              <input
                type="number"
                step="0.01"
                value={newCost}
                onChange={e => setNewCost(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-2.5 rounded-xl border border-rose-100 bg-cream-50 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all"
              />
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={showStockIn}
        onClose={() => { setShowStockIn(false); setStockInQuantity(''); setStockInRemark(''); }}
        title="产品入库"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setShowStockIn(false); }}>取消</Button>
            <Button onClick={handleStockIn} disabled={!selectedProductId || !stockInQuantity}>确认入库</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-brown-600 mb-2">选择产品</label>
            <select
              value={selectedProductId}
              onChange={e => setSelectedProductId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-rose-100 bg-cream-50 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all"
            >
              <option value="">请选择产品</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}（当前库存：{p.stock} {p.unit}）</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-brown-600 mb-2">入库数量</label>
            <input
              type="number"
              min="1"
              value={stockInQuantity}
              onChange={e => setStockInQuantity(e.target.value)}
              placeholder="请输入数量"
              className="w-full px-4 py-2.5 rounded-xl border border-rose-100 bg-cream-50 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brown-600 mb-2">备注</label>
            <input
              type="text"
              value={stockInRemark}
              onChange={e => setStockInRemark(e.target.value)}
              placeholder="如：月初进货、补货等"
              className="w-full px-4 py-2.5 rounded-xl border border-rose-100 bg-cream-50 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all"
            />
          </div>
        </div>
      </Modal>

      <Modal
        open={showLogs}
        onClose={() => setShowLogs(false)}
        title="出入库记录"
      >
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {inventoryLogs.length === 0 ? (
            <p className="text-center py-8 text-brown-400">暂无记录</p>
          ) : (
            [...inventoryLogs].reverse().map(log => {
              const product = products.find(p => p.id === log.productId);
              return (
                <div key={log.id} className="flex items-center justify-between p-3 bg-cream-50 rounded-lg">
                  <div>
                    <p className="font-medium text-brown-700">{product?.name || '未知产品'}</p>
                    <p className="text-xs text-brown-400">{formatDateTime(log.createdAt)} · {log.remark}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-sm font-medium ${logColors[log.type]}`}>
                    {InventoryLogTypeMap[log.type]} {log.type === 'in' ? '+' : '-'}{log.quantity}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </Modal>

      <Modal
        open={showProductDetail}
        onClose={() => { setShowProductDetail(false); setSelectedProductId(''); }}
        title="产品详情"
        footer={
          selectedProduct && (
            <>
              <Button 
                variant="secondary" 
                onClick={() => { 
                  setShowProductDetail(false); 
                  openStockIn(selectedProduct.id); 
                }}
                icon={<ArrowUpDown className="w-4 h-4" />}
              >
                入库登记
              </Button>
              {restockSuggestion.quantity > 0 && (
                <Button 
                  onClick={() => { 
                    addInventory(selectedProduct.id, restockSuggestion.quantity, '建议补货');
                  }}
                  icon={<TrendingUp className="w-4 h-4" />}
                >
                  按建议补货 ({restockSuggestion.quantity})
                </Button>
              )}
            </>
          )
        }
      >
        {selectedProduct && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                selectedProduct.stock <= selectedProduct.warningThreshold ? 'bg-rose-100' : 'bg-cream-100'
              }`}>
                <Package className={`w-8 h-8 ${
                  selectedProduct.stock <= selectedProduct.warningThreshold ? 'text-rose-500' : 'text-rose-400'
                }`} />
              </div>
              <div>
                <h3 className="font-serif text-xl font-semibold text-brown-700">{selectedProduct.name}</h3>
                <p className="text-sm text-brown-400 mt-1">成本价 ¥{selectedProduct.costPrice}/{selectedProduct.unit}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-cream-50 rounded-xl">
                <p className="text-sm text-brown-400 mb-1">当前库存</p>
                <p className={`text-2xl font-bold font-serif ${
                  selectedProduct.stock <= selectedProduct.warningThreshold ? 'text-rose-500' : 'text-brown-700'
                }`}>
                  {selectedProduct.stock}
                  <span className="text-sm font-normal text-brown-400 ml-1">{selectedProduct.unit}</span>
                </p>
              </div>
              <div className="p-4 bg-cream-50 rounded-xl">
                <p className="text-sm text-brown-400 mb-1">预警阈值</p>
                <p className="text-2xl font-bold font-serif text-brown-700">
                  {selectedProduct.warningThreshold}
                  <span className="text-sm font-normal text-brown-400 ml-1">{selectedProduct.unit}</span>
                </p>
              </div>
            </div>

            {restockSuggestion.quantity > 0 && (
              <div className="p-4 bg-gold-50 rounded-xl border border-gold-100">
                <div className="flex items-center gap-2 text-sm text-gold-700 font-medium mb-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>补货建议</span>
                </div>
                <p className="text-lg font-bold text-gold-600 mb-1">建议补货 {restockSuggestion.quantity} {selectedProduct.unit}</p>
                <p className="text-xs text-brown-500">{restockSuggestion.reason}</p>
              </div>
            )}

            <div>
              <h4 className="font-medium text-brown-700 mb-3 flex items-center gap-2">
                <History className="w-4 h-4" />
                出入库记录
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {productLogs.length === 0 ? (
                  <p className="text-center py-6 text-brown-400 text-sm">暂无记录</p>
                ) : (
                  productLogs.map(log => {
                    const apt = appointments.find(a => a.id === log.appointmentId);
                    return (
                      <div key={log.id} className="flex items-center justify-between p-3 bg-cream-50 rounded-lg">
                        <div>
                          <p className="font-medium text-brown-700 text-sm">{log.remark}</p>
                          <p className="text-xs text-brown-400">{formatDateTime(log.createdAt)}</p>
                          {apt && (
                            <p className="text-xs text-rose-400 mt-0.5">关联预约 · {formatDate(apt.startTime)}</p>
                          )}
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${logColors[log.type]}`}>
                          {InventoryLogTypeMap[log.type]} {log.type === 'in' ? '+' : '-'}{log.quantity}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
