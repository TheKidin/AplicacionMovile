import { supabase } from '../lib/supabaseClient';

export const subscriptionService = {
  async getSubscriptions() {
    const { data, error } = await supabase.from('subscriptions').select('*, clinic:clinics(*)').order('created_at', { ascending: false });
    if (error) { console.error('Error:', error); return []; }
    return data || [];
  },
  async createSubscription(subData) {
    const { data, error } = await supabase.from('subscriptions').insert([subData]).select();
    if (error) throw error;
    return data;
  },
  async getPayments(clinicId) {
    let query = supabase.from('payments').select('*').order('created_at', { ascending: false });
    if (clinicId) query = query.eq('clinic_id', clinicId);
    const { data, error } = await query;
    if (error) { console.error('Error:', error); return []; }
    return data || [];
  },
  async registerPayment(paymentData) {
    const { data, error } = await supabase.from('payments').insert([paymentData]).select();
    if (error) throw error;
    return data;
  },
  async updateSubscription(id, updateData) {
    const { data, error } = await supabase
      .from('subscriptions')
      .update(updateData)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data;
  },
  async cancelSubscription(id) {
    const { data, error } = await supabase
      .from('subscriptions')
      .update({ status: 'CANCELLED', cancelled_at: new Date().toISOString() })
      .eq('id', id)
      .select();
    if (error) throw error;
    return data;
  },
};
