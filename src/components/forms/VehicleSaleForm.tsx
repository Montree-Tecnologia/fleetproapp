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
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { formatCurrency, formatInteger, handleCurrencyInput, handleIntegerInput } from '@/lib/formatters';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  refrigerationSale?: {
    sellRefrigeration: boolean;
    refrigerationPrice?: number;
  };
}

interface VehicleSaleFormProps {
  onSubmit: (data: VehicleSale) => void;
  onCancel: () => void;
  currentKm: number;
  hasRefrigeration?: boolean;
  refrigerationId?: string;
}

export function VehicleSaleForm({ onSubmit, onCancel, currentKm, hasRefrigeration, refrigerationId }: VehicleSaleFormProps) {
  const [paymentReceipt, setPaymentReceipt] = useState<string | undefined>();
  const [transferDocument, setTransferDocument] = useState<string | undefined>();
  const [showRefrigerationQuestion, setShowRefrigerationQuestion] = useState(false);
  const [sellRefrigeration, setSellRefrigeration] = useState<boolean | null>(null);
  const [refrigerationPrice, setRefrigerationPrice] = useState<string>('');
  
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

  const removePaymentReceipt = () => {
    setPaymentReceipt(undefined);
  };

  const removeTransferDocument = () => {
    setTransferDocument(undefined);
  };

  const handleSubmit = (data: VehicleSaleFormData) => {
    if (data.km < currentKm) {
      form.setError('km', { 
        message: `KM deve ser maior ou igual ao KM atual do veículo (${currentKm.toLocaleString('pt-BR')})` 
      });
      return;
    }

    // Se tem refrigeração vinculada e ainda não perguntou
    if (hasRefrigeration && sellRefrigeration === null) {
      setShowRefrigerationQuestion(true);
      return;
    }

    // Se vai vender a refrigeração mas não informou o preço
    if (sellRefrigeration && !refrigerationPrice) {
      return; // Não procede sem o preço
    }

    const saleData: VehicleSale = {
      buyerName: data.buyerName,
      buyerCpfCnpj: data.buyerCpfCnpj,
      saleDate: format(data.saleDate, 'yyyy-MM-dd'),
      km: data.km,
      salePrice: data.salePrice,
      paymentReceipt,
      transferDocument,
    };

    // Adiciona informações de venda da refrigeração se aplicável
    if (hasRefrigeration && sellRefrigeration !== null) {
      saleData.refrigerationSale = {
        sellRefrigeration,
        refrigerationPrice: sellRefrigeration ? parseFloat(refrigerationPrice.replace(/\./g, '').replace(',', '.')) : undefined,
      };
    }

    onSubmit(saleData);
  };

  return (
    <>
      <AlertDialog open={showRefrigerationQuestion} onOpenChange={setShowRefrigerationQuestion}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Equipamento de Refrigeração Vinculado
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>Este veículo possui um equipamento de refrigeração vinculado.</p>
              <p className="font-semibold">O equipamento de refrigeração também está sendo vendido?</p>
              
              {sellRefrigeration && (
                <div className="space-y-2 pt-2">
                  <label className="text-sm font-medium text-foreground">
                    Preço de Venda do Equipamento (R$) *
                  </label>
                  <Input
                    type="text"
                    placeholder="Ex: 50.000,00"
                    value={refrigerationPrice}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      const numValue = parseFloat(value) / 100;
                      setRefrigerationPrice(formatCurrency(numValue));
                    }}
                    className="bg-background"
                  />
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => {
                setSellRefrigeration(false);
                setShowRefrigerationQuestion(false);
                // Após responder, submeter novamente
                setTimeout(() => form.handleSubmit(handleSubmit)(), 0);
              }}
            >
              Não, apenas desvincular
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!sellRefrigeration) {
                  // Primeira vez clicando em "Sim"
                  setSellRefrigeration(true);
                } else if (refrigerationPrice && parseFloat(refrigerationPrice.replace(/\./g, '').replace(',', '.')) > 0) {
                  // Já informou o preço
                  setShowRefrigerationQuestion(false);
                  setTimeout(() => form.handleSubmit(handleSubmit)(), 0);
                }
              }}
              disabled={sellRefrigeration && (!refrigerationPrice || parseFloat(refrigerationPrice.replace(/\./g, '').replace(',', '.')) <= 0)}
            >
              Sim, vender equipamento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
    </>
  );
}