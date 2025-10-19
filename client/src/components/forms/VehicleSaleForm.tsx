import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, Upload, X, FileText, AlertCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { formatCurrency, formatInteger, handleCurrencyInput, handleIntegerInput } from '@/lib/formatters';
import { useState } from 'react';

const saleSchema = z.object({
  buyerName: z.string().min(3, 'Nome do comprador é obrigatório'),
  buyerCpfCnpj: z.string().min(11, 'CPF/CNPJ do comprador é obrigatório'),
  saleDate: z.date({
    required_error: 'Data da venda é obrigatória',
  }),
  km: z.number().min(0, 'Quilometragem deve ser positiva'),
  salePrice: z.number().min(1, 'Preço de venda deve ser maior que 0'),
});

type VehicleSaleFormData = z.infer<typeof saleSchema>;

export interface VehicleSale {
  buyerName: string;
  buyerCpfCnpj: string;
  saleDate: string;
  km: number;
  salePrice: number;
  paymentReceipt?: string;
  transferDocument?: string;
  saleInvoice?: string;
  refrigerationSale?: {
    sellRefrigeration: boolean;
    refrigerationPrice?: number;
    refrigerationUsageHours?: number;
  };
}

interface VehicleSaleFormProps {
  onSubmit: (data: VehicleSale) => void;
  onCancel: () => void;
  currentKm: number;
  hasRefrigeration?: boolean;
  refrigerationId?: string;
  currentRefrigerationUsageHours?: number;
}

export function VehicleSaleForm({ onSubmit, onCancel, currentKm, hasRefrigeration, refrigerationId, currentRefrigerationUsageHours }: VehicleSaleFormProps) {
  const [paymentReceipt, setPaymentReceipt] = useState<string | undefined>();
  const [transferDocument, setTransferDocument] = useState<string | undefined>();
  const [saleInvoice, setSaleInvoice] = useState<string | undefined>();
  const [showRefrigerationQuestion, setShowRefrigerationQuestion] = useState(false);
  const [sellRefrigeration, setSellRefrigeration] = useState(false);
  const [refrigerationPrice, setRefrigerationPrice] = useState('');
  const [refrigerationUsageHours, setRefrigerationUsageHours] = useState(
    currentRefrigerationUsageHours ? formatInteger(currentRefrigerationUsageHours) : ''
  );
  
  const form = useForm<VehicleSaleFormData>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      saleDate: new Date(),
      km: currentKm,
      salePrice: 0,
    },
  });

  const handlePaymentReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentReceipt(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTransferDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTransferDocument(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaleInvoiceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSaleInvoice(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePaymentReceipt = () => {
    setPaymentReceipt(undefined);
  };

  const removeTransferDocument = () => {
    setTransferDocument(undefined);
  };

  const removeSaleInvoice = () => {
    setSaleInvoice(undefined);
  };

  const handleSubmit = (data: VehicleSaleFormData) => {
    if (data.km < currentKm) {
      form.setError('km', { 
        message: `KM deve ser maior ou igual ao KM atual do veículo (${currentKm.toLocaleString('pt-BR')})` 
      });
      return;
    }

    // Se o veículo tem equipamento de refrigeração, perguntar primeiro
    if (hasRefrigeration && !showRefrigerationQuestion) {
      setShowRefrigerationQuestion(true);
      return;
    }

    const saleData: VehicleSale = {
      buyerName: data.buyerName,
      buyerCpfCnpj: data.buyerCpfCnpj,
      saleDate: format(data.saleDate, 'yyyy-MM-dd'),
      km: data.km,
      salePrice: data.salePrice,
      paymentReceipt,
      transferDocument,
      saleInvoice,
    };

    // Adicionar informações de venda do equipamento se aplicável
    if (hasRefrigeration) {
      saleData.refrigerationSale = {
        sellRefrigeration,
        refrigerationPrice: sellRefrigeration && refrigerationPrice 
          ? parseFloat(refrigerationPrice.replace(/\./g, '').replace(',', '.'))
          : undefined,
        refrigerationUsageHours: sellRefrigeration && refrigerationUsageHours
          ? parseInt(refrigerationUsageHours.replace(/\./g, ''))
          : undefined,
      };
    }

    onSubmit(saleData);
  };

  const handleRefrigerationDecision = (sell: boolean) => {
    setSellRefrigeration(sell);
    if (!sell) {
      // Se não vai vender, finaliza a venda do veículo
      setShowRefrigerationQuestion(false);
      form.handleSubmit((data) => {
        onSubmit({
          buyerName: data.buyerName,
          buyerCpfCnpj: data.buyerCpfCnpj,
          saleDate: format(data.saleDate, 'yyyy-MM-dd'),
          km: data.km,
          salePrice: data.salePrice,
          paymentReceipt,
          transferDocument,
          saleInvoice,
          refrigerationSale: {
            sellRefrigeration: false,
          },
        });
      })();
    }
  };

  const handleConfirmRefrigerationSale = () => {
    if (!refrigerationUsageHours) {
      return;
    }
    
    form.handleSubmit((data) => {
      onSubmit({
        buyerName: data.buyerName,
        buyerCpfCnpj: data.buyerCpfCnpj,
        saleDate: format(data.saleDate, 'yyyy-MM-dd'),
        km: data.km,
        salePrice: data.salePrice,
        paymentReceipt,
        transferDocument,
        saleInvoice,
        refrigerationSale: {
          sellRefrigeration: true,
          refrigerationPrice: refrigerationPrice 
            ? parseFloat(refrigerationPrice.replace(/\./g, '').replace(',', '.'))
            : 0,
          refrigerationUsageHours: parseInt(refrigerationUsageHours.replace(/\./g, '')),
        },
      });
    })();
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="buyerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Comprador *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome completo ou razão social" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="buyerCpfCnpj"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF/CNPJ do Comprador *</FormLabel>
                  <FormControl>
                    <Input placeholder="000.000.000-00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="saleDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data da Venda *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "dd/MM/yyyy")
                          ) : (
                            <span>Selecione a data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date()}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="km"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quilometragem na Venda *</FormLabel>
                  <FormControl>
                    <Input 
                      type="text"
                      placeholder="Ex: 150.000"
                      {...field}
                      value={field.value ? formatInteger(field.value) : ''}
                      onChange={(e) => handleIntegerInput(e, field.onChange)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="salePrice"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Preço de Venda (R$) *</FormLabel>
                  <FormControl>
                    <Input 
                      type="text"
                      placeholder="Ex: 150.000,00"
                      {...field}
                      value={field.value ? formatCurrency(field.value) : ''}
                      onChange={(e) => handleCurrencyInput(e, field.onChange)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Comprovante de Recebimento</label>
              <div className="space-y-2">
                {paymentReceipt ? (
                  <div className="relative">
                    {paymentReceipt.startsWith('data:image') ? (
                      <img
                        src={paymentReceipt}
                        alt="Comprovante"
                        className="w-full h-40 object-cover rounded-lg border border-border"
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-muted rounded-lg border border-border">
                        <FileText className="h-5 w-5" />
                        <span className="text-sm">Comprovante anexado</span>
                      </div>
                    )}
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8"
                      onClick={removePaymentReceipt}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <Input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handlePaymentReceiptUpload}
                      className="hidden"
                      id="payment-receipt-upload"
                    />
                    <label htmlFor="payment-receipt-upload">
                      <Button type="button" variant="outline" className="w-full" asChild>
                        <span className="cursor-pointer">
                          <Upload className="h-4 w-4 mr-2" />
                          Anexar Comprovante
                        </span>
                      </Button>
                    </label>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">CRV Assinado (Transferência)</label>
              <div className="space-y-2">
                {transferDocument ? (
                  <div className="relative">
                    {transferDocument.startsWith('data:image') ? (
                      <img
                        src={transferDocument}
                        alt="CRV"
                        className="w-full h-40 object-cover rounded-lg border border-border"
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-muted rounded-lg border border-border">
                        <FileText className="h-5 w-5" />
                        <span className="text-sm">CRV anexado</span>
                      </div>
                    )}
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8"
                      onClick={removeTransferDocument}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <Input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleTransferDocumentUpload}
                      className="hidden"
                      id="transfer-document-upload"
                    />
                    <label htmlFor="transfer-document-upload">
                      <Button type="button" variant="outline" className="w-full" asChild>
                        <span className="cursor-pointer">
                          <Upload className="h-4 w-4 mr-2" />
                          Anexar CRV
                        </span>
                      </Button>
                    </label>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Nota Fiscal de Venda</label>
              <div className="space-y-2">
                {saleInvoice ? (
                  <div className="relative">
                    {saleInvoice.startsWith('data:image') ? (
                      <img
                        src={saleInvoice}
                        alt="Nota Fiscal"
                        className="w-full h-40 object-cover rounded-lg border border-border"
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-muted rounded-lg border border-border">
                        <FileText className="h-5 w-5" />
                        <span className="text-sm">Nota Fiscal anexada</span>
                      </div>
                    )}
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8"
                      onClick={removeSaleInvoice}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <Input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleSaleInvoiceUpload}
                      className="hidden"
                      id="sale-invoice-upload"
                    />
                    <label htmlFor="sale-invoice-upload">
                      <Button type="button" variant="outline" className="w-full" asChild>
                        <span className="cursor-pointer">
                          <Upload className="h-4 w-4 mr-2" />
                          Anexar Nota Fiscal
                        </span>
                      </Button>
                    </label>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline-destructive" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit">
              Confirmar Venda
            </Button>
          </div>
        </form>
      </Form>

      {/* Diálogo de pergunta sobre equipamento de refrigeração */}
      <AlertDialog open={showRefrigerationQuestion && !sellRefrigeration}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              <AlertDialogTitle>Equipamento de Refrigeração</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              Este veículo possui um equipamento de refrigeração vinculado. O equipamento também está sendo vendido?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => handleRefrigerationDecision(false)}>
              Não, apenas desvincular
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => handleRefrigerationDecision(true)}>
              Sim, vender equipamento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo para informar preço e horímetro do equipamento de refrigeração */}
      <AlertDialog open={showRefrigerationQuestion && sellRefrigeration}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Dados da Venda do Equipamento</AlertDialogTitle>
            <AlertDialogDescription>
              Informe os dados de venda do equipamento de refrigeração. Os dados do comprador serão os mesmos do veículo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Horímetro - Venda *</label>
              <Input 
                type="text"
                placeholder="Ex: 15.000"
                value={refrigerationUsageHours}
                onChange={(e) => handleIntegerInput(e, (value) => {
                  setRefrigerationUsageHours(value ? formatInteger(value) : '');
                })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Preço de Venda do Equipamento (R$)</label>
              <Input 
                type="text"
                placeholder="Ex: 50.000,00 (aceita zero)"
                value={refrigerationPrice}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  const numericValue = parseInt(value) || 0;
                  const formatted = new Intl.NumberFormat('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(numericValue / 100);
                  setRefrigerationPrice(formatted);
                }}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setSellRefrigeration(false);
              setRefrigerationPrice('');
              setRefrigerationUsageHours(currentRefrigerationUsageHours ? formatInteger(currentRefrigerationUsageHours) : '');
            }}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmRefrigerationSale}
              disabled={!refrigerationUsageHours}
            >
              Confirmar Venda
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}