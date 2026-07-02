import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useOrderDetails } from '../api/orderQueries';
import { Truck, CheckCircle, Navigation, RefreshCw } from 'lucide-react';
import { API_BASE } from '../api/apiClient';

const routeCoordinates = [
  { lat: 20.0881, lng: 79.6200 },
  { lat: 20.0888, lng: 79.6215 },
  { lat: 20.0895, lng: 79.6230 },
  { lat: 20.0902, lng: 79.6245 },
  { lat: 20.0910, lng: 79.6260 },
];

export default function Tracking() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('id') || '';

  const { data: orderData, isLoading } = useOrderDetails(orderId);
  const order = orderData?.order;

  const [status, setStatus] = useState<string>('Placed');
  const [driverLoc, setDriverLoc] = useState({ lat: 20.0881, lng: 79.6200 });
  const [routeIndex, setRouteIndex] = useState(0);
  const [socketConnected, setSocketConnected] = useState(false);

  useEffect(() => {
    if (order) {
      setStatus(order.status);
    }
  }, [order]);

  useEffect(() => {
    if (!orderId) return;

    const socketUrl = API_BASE.replace('/api', '');
    const socket = io(socketUrl);

    socket.on('connect', () => {
      setSocketConnected(true);
      socket.emit('join_order', orderId);
    });

    socket.on('driver_location', (data: { latitude: number; longitude: number }) => {
      setDriverLoc({ lat: data.latitude, lng: data.longitude });
    });

    socket.on('order_status_change', (data: { status: string }) => {
      setStatus(data.status);
    });

    return () => {
      socket.disconnect();
    };
  }, [orderId]);

  const startSimulation = () => {
    let index = 0;
    const socketUrl = API_BASE.replace('/api', '');
    const socket = io(socketUrl);
    
    const interval = setInterval(() => {
      if (index >= routeCoordinates.length) {
        clearInterval(interval);
        socket.disconnect();
        return;
      }
      const coord = routeCoordinates[index];
      setDriverLoc(coord);
      setRouteIndex(index);
      
      socket.emit('driver_location_update', {
        orderId,
        latitude: coord.lat,
        longitude: coord.lng
      });
      
      index++;
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 animate-pulse space-y-6">
        <div className="h-10 bg-slate-200 rounded w-1/3"></div>
        <div className="h-96 bg-white rounded-3xl skeleton-pulse"></div>
      </div>
    );
  }

  const steps = ['Placed', 'Confirmed', 'Packed', 'Shipped', 'Out For Delivery', 'Delivered'];
  const currentStepIndex = steps.indexOf(status);

  // If order is cancelled or returned, we prepend or append it
  const isCancelled = status === 'Cancelled';
  const isReturned = status === 'Returned';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in pb-24">
      <div className="bg-white border border-brand-border/60 rounded-3xl p-6 md:p-8 shadow-sm space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-brand-light pb-6">
          <div>
            <span className="text-[10px] font-extrabold text-brand-green uppercase tracking-widest bg-brand-green/10 px-3 py-1.5 rounded-full">
              Live Order Tracking
            </span>
            <h1 className="font-extrabold text-2xl text-brand-dark mt-3">Order {order?.orderId}</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-brand-green animate-pulse' : 'bg-red-500'}`}></span>
            <span className="text-xs text-brand-muted font-bold">
              {socketConnected ? 'Real-Time Connected' : 'Connecting WebSocket...'}
            </span>
          </div>
        </div>

        {/* Cancelled/Returned banners */}
        {isCancelled && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl font-bold text-sm">
            ❌ This order has been Cancelled.
          </div>
        )}
        {isReturned && (
          <div className="bg-orange-50 border border-orange-200 text-[#d97706] px-6 py-4 rounded-2xl font-bold text-sm">
            ↩ This order has been Returned.
          </div>
        )}

        {/* Map Simulator */}
        {!isCancelled && !isReturned && (
          <div className="relative bg-brand-light rounded-2xl p-6 pt-12 pb-20 border flex flex-col items-center justify-start min-h-[280px] overflow-hidden">
            <div className="absolute top-4 left-4 bg-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 border border-brand-border/60 z-10">
              <Navigation className="w-3.5 h-3.5 text-brand-green" />
              <span>Driver Map Simulator</span>
            </div>

            <div className="text-center space-y-4 relative z-10">
              <div className="inline-flex bg-brand-green/10 p-4 rounded-full text-brand-green animate-bounce">
                <Truck className="w-8 h-8" />
              </div>
              <div>
                <p className="font-extrabold text-sm text-brand-dark">Driver Simulated Coordinates</p>
                <p className="text-xs text-brand-muted mt-0.5">Lat: {driverLoc.lat.toFixed(4)}, Lng: {driverLoc.lng.toFixed(4)}</p>
              </div>
              <button
                onClick={startSimulation}
                className="btn-primary py-2 px-5 text-xs font-extrabold flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Simulate Driver Transit Route</span>
              </button>
            </div>

            <div className="absolute bottom-4 left-4 right-4 bg-white/80 backdrop-blur-sm p-3.5 rounded-xl border flex items-center justify-between z-10 text-[10px] font-bold text-brand-dark">
              <span>Bhangaram Store</span>
              <div className="flex-1 mx-3 h-1 bg-slate-200 relative rounded-full">
                <div 
                  className="absolute top-0 bottom-0 bg-brand-green rounded-full transition-all duration-300"
                  style={{ width: `${(routeIndex / (routeCoordinates.length - 1)) * 100}%` }}
                ></div>
              </div>
              <span>Talodhi Home</span>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="space-y-6">
          <h3 className="font-extrabold text-base text-brand-dark uppercase tracking-wider">Delivery Timeline</h3>
          <div className="relative pl-8 space-y-8 before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
            
            {steps.map((step, idx) => {
              const historyItem = order?.statusHistory?.find((h: any) => h.status === step);
              const isCompleted = idx <= currentStepIndex && (!isCancelled && !isReturned);
              const isActive = idx === currentStepIndex && (!isCancelled && !isReturned);
              const dateText = historyItem ? new Date(historyItem.updatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ', ' + new Date(historyItem.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : null;

              return (
                <div key={step} className="relative flex items-start gap-4">
                  
                  <span className={`absolute -left-8 w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all text-xs font-bold ${
                    isCompleted 
                      ? 'bg-brand-green border-brand-green text-white shadow-md shadow-brand-green/20' 
                      : 'bg-white border-slate-200 text-slate-300'
                  }`}>
                    {isCompleted ? '✓' : idx + 1}
                  </span>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className={`font-extrabold text-sm ${isActive ? 'text-brand-green' : isCompleted ? 'text-brand-dark' : 'text-brand-muted'}`}>
                        {step}
                      </h4>
                      {dateText && (
                        <span className="text-[10px] text-brand-muted bg-brand-light px-2 py-0.5 rounded font-bold">
                          {dateText}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-brand-muted font-medium mt-1">
                      {historyItem?.note || (isActive 
                        ? 'Processing this stage right now.' 
                        : isCompleted 
                        ? 'Completed successfully.' 
                        : 'Stage not reached yet.')}
                    </p>
                  </div>

                </div>
              );
            })}

          </div>
        </div>

      </div>
    </div>
  );
}
