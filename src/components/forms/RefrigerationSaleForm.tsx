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
import { CalendarIcon, Upload, X, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const saleSchema = z.object({
  buyerName: z.string().trim().min(3, 'Nome do comprador é obrigatório').max(100, 'Nome muito longo'),
  buyerCpfCnpj: z.string().trim().min(11, 'CPF/CNPJ do comprador é obrigatório').max(18, 'CPF/CNPJ inválido'),
  saleDate: z.date({
    required_error: 'Data da venda é obrigatória',
  }),
  usageHours: z.number().min(0, 'Horas de uso devem ser positivas').max(999999, 'Valor muito alto'),
  salePrice: z.number().min(1, 'Preço de venda deve ser maior que 0').max(99999999, 'Valor muito alto'),
});

type RefrigerationSaleFormData = z.infer<typeof saleSchema>;

export interface RefrigerationSale {
  buyerName: string;
  buyerCpfCnpj: string;
  saleDate: string;
  usageHours: number;
  salePrice: number;
  paymentReceipt?: string;
  transferDocument?: string;
}

interface RefrigerationSaleFormProps {
  onSubmit: (data: RefrigerationSale) => void;
  onCancel: () => void;
  currentUsageHours: number;
}

export function RefrigerationSaleForm({ onSubmit, onCancel, currentUsageHours }: RefrigerationSaleFormProps) {
  const [paymentReceipt, setPaymentReceipt] = useState<string | undefined>();
  const [transferDocument, setTransferDocument] = useState<string | undefined>();
  
  const form = useForm<RefrigerationSaleFormData>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      saleDate: new Date(),
      usageHours: currentUsageHours,
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

  const removePaymentReceipt = () => {
    setPaymentReceipt(undefined);
  };

  const removeTransferDocument = () => {
    setTransferDocument(undefined);
  };

  const handleSubmit = (data: RefrigerationSaleFormData) => {
    if (data.usageHours < currentUsageHours) {
      form.setError('usageHours', { 
        message: `Horas de uso devem ser maiores ou iguais às horas atuais (${currentUsageHours.toLocaleString('pt-BR')})` 
      });
      return;
    }

    onSubmit({
      buyerName: data.buyerName,
      buyerCpfCnpj: data.buyerCpfCnpj,
      saleDate: format(data.saleDate, 'yyyy-MM-dd'),
      usageHours: data.usageHours,
      salePrice: data.salePrice,
      paymentReceipt,
      transferDocument,
    });
  };

  return (
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
            name="usageHours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horas de Uso na Venda *</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
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
                    type="number" 
                    step="0.01"
                    placeholder="0.00"
                    {...field} 
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
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
            <label className="text-sm font-medium">Nota Fiscal de Venda</label>
            <div className="space-y-2">
              {transferDocument ? (
                <div className="relative">
                  {transferDocument.startsWith('data:image') ? (
                    <img
                      src={transferDocument}
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
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            Confirmar Venda
          </Button>
        </div>
      </form>
    </Form>
  );
}
