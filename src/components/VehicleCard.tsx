import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Truck, Pencil, Trash2, Eye, DollarSign, Link2, Plus, X, Check, ChevronsUpDown } from 'lucide-react';
import { Vehicle } from '@/hooks/useMockData';
import { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';

interface VehicleCardProps {
  vehicle: Vehicle;
  getStatusBadge: (status: string) => JSX.Element;
  getRefrigerationUnit: (vehicleId: string) => any;
  calculateAverageConsumption: (vehicleId: string) => number | null;
  allDrivers: any[];
  allVehicles: Vehicle[];
  getAvailableDrivers: (currentVehicleId: string) => any[];
  handleDriverChange: (vehicleId: string, driverId: string) => void;
  handleStatusChange: (vehicleId: string, plate: string, status: string, currentStatus: string) => void;
  handleViewDetails: (vehicle: Vehicle) => void;
  handleEdit: (vehicle: Vehicle) => void;
  handleSellVehicle: (vehicle: Vehicle) => void;
  handleDelete: (vehicle: Vehicle) => void;
  handleReverseSale: (vehicle: Vehicle) => void;
  handleAddComposition: (vehicleId: string, trailerId: string) => void;
  handleRemoveComposition: (vehicleId: string, trailerPlate: string) => void;
  isAdmin: () => boolean;
}

export function VehicleCard({
  vehicle,
  getStatusBadge,
  getRefrigerationUnit,
  calculateAverageConsumption,
  allDrivers,
  allVehicles,
  getAvailableDrivers,
  handleDriverChange,
  handleStatusChange,
  handleViewDetails,
  handleEdit,
  handleSellVehicle,
  handleDelete,
  handleReverseSale,
  handleAddComposition,
  handleRemoveComposition,
  isAdmin,
}: VehicleCardProps) {
  const [showAddComposition, setShowAddComposition] = useState(false);
  const [openDriver, setOpenDriver] = useState(false);
  const [openComposition, setOpenComposition] = useState(false);
  
  const tractionVehicleTypes = ['Truck', 'Cavalo Mecânico', 'Toco', 'VUC', '3/4', 'Bitruck'];
  const trailerVehicleTypes = ['Baú', 'Carreta', 'Graneleiro', 'Container', 'Caçamba', 'Baú Frigorífico', 'Sider', 'Prancha', 'Tanque', 'Cegonheiro', 'Rodotrem'];
  const isTractionVehicle = tractionVehicleTypes.includes(vehicle.vehicleType);
  const isTrailerVehicle = trailerVehicleTypes.includes(vehicle.vehicleType);
  const canHaveCompositions = vehicle.vehicleType === 'Cavalo Mecânico'; // Apenas Cavalo Mecânico pode ter composições
  const showCompositionsSection = isTractionVehicle; // Mostrar seção para todos os tipos de tração
  
  // Motoristas disponíveis (não vinculados a outros veículos)
  const availableDrivers = getAvailableDrivers(vehicle.id);
  
  // Veículos de reboque disponíveis para adicionar
  const availableTrailers = allVehicles.filter(v => {
    if (!trailerVehicleTypes.includes(v.vehicleType)) return false;
    if (v.status !== 'active') return false;
    if (vehicle.compositionPlates?.includes(v.plate)) return false;
    
    // Verifica se o reboque já está vinculado a outro veículo de tração
    const isLinkedToOther = allVehicles.some(vehicle2 => 
      vehicle2.id !== vehicle.id &&
      vehicle2.hasComposition && 
      vehicle2.compositionPlates?.includes(v.plate)
    );
    
    return !isLinkedToOther;
  });
  
  // Encontra os detalhes dos reboques vinculados (para veículos de tração)
  const linkedTrailers = vehicle.compositionPlates?.map(plate => 
    allVehicles.find(v => v.plate === plate)
  ).filter(Boolean) || [];
  
  // Encontra os veículos de tração que têm este reboque vinculado (para veículos de reboque)
  const linkedToTractionVehicles = isTrailerVehicle ? allVehicles.filter(v => 
    tractionVehicleTypes.includes(v.vehicleType) &&
    v.hasComposition && 
    v.compositionPlates?.includes(vehicle.plate)
  ) : [];
  
  // Verifica se deve mostrar a etiqueta "Refrigerado"
  const isRefrigerated = (() => {
    // Se o próprio veículo tem equipamento de refrigeração (exceto cavalo mecânico sem composição)
    const hasOwnRefrigeration = getRefrigerationUnit(vehicle.id);
    if (hasOwnRefrigeration && vehicle.vehicleType !== 'Cavalo Mecânico') {
      return true;
    }
    
    // Se é cavalo mecânico com composição refrigerada
    if (vehicle.vehicleType === 'Cavalo Mecânico' && vehicle.hasComposition && linkedTrailers.length > 0) {
      return linkedTrailers.some(trailer => trailer && getRefrigerationUnit(trailer.id));
    }
    
    return false;
  })();
  return (
    <TooltipProvider>
      <Card className={cn(
        "hover:shadow-lg transition-shadow",
        vehicle.status === 'sold' && "opacity-60 grayscale"
      )}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {vehicle.images && vehicle.images.length > 0 ? (
              <img
                src={vehicle.images[0]}
                alt={vehicle.plate}
                className="w-12 h-12 object-cover rounded-lg"
              />
            ) : (
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Truck className="h-6 w-6 text-primary" />
              </div>
            )}
            <div>
              <CardTitle className="text-lg">{vehicle.plate}</CardTitle>
              <p className="text-sm text-muted-foreground">{vehicle.model}</p>
            </div>
          </div>
          <div className="flex flex-col gap-2 items-end">
            {getStatusBadge(vehicle.status)}
            {isRefrigerated && (
              <Badge variant="outline" className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20">
                Refrigerado
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground">Tipo:</span>
            <p className="font-medium">{vehicle.vehicleType}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Marca:</span>
            <p className="font-medium">{vehicle.brand}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Ano:</span>
            <p className="font-medium">
              {vehicle.manufacturingYear && vehicle.modelYear 
                ? `${vehicle.manufacturingYear}/${vehicle.modelYear.toString().slice(-2)}`
                : 'N/A'}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Proprietária:</span>
            <p className="font-medium">{vehicle.ownerBranch}</p>
          </div>
          {(isTractionVehicle || isTrailerVehicle) && (
            <>
              <div>
                <span className="text-muted-foreground">KM Rodados:</span>
                <p className="font-medium">{(vehicle.currentKm - vehicle.purchaseKm).toLocaleString('pt-BR')}</p>
              </div>
              <div>
                <span className="text-muted-foreground">KM Atual:</span>
                <p className="font-medium">{vehicle.currentKm.toLocaleString('pt-BR')}</p>
              </div>
            </>
          )}
          {isTractionVehicle && (
            <div>
              <span className="text-muted-foreground">Consumo Médio:</span>
              <p className="font-medium">
                {(() => {
                  const avgConsumption = calculateAverageConsumption(vehicle.id);
                  return avgConsumption 
                    ? `${avgConsumption.toFixed(2)} km/l` 
                    : 'N/A';
                })()}
              </p>
            </div>
          )}
          {vehicle.weight && (
            <div>
              <span className="text-muted-foreground">Peso:</span>
              <p className="font-medium">{vehicle.weight} ton</p>
            </div>
          )}
          <div className="col-span-2">
            <span className="text-muted-foreground">Matriz/Filiais Vinculadas:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {vehicle.branches.map((branch, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {branch}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        
        {showCompositionsSection && (
          <div className="pt-3 border-t border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Composições:</span>
              {canHaveCompositions && vehicle.status !== 'sold' && vehicle.status === 'active' && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2"
                  onClick={() => setShowAddComposition(!showAddComposition)}
                >
                  {showAddComposition ? (
                    <X className="h-3 w-3" />
                  ) : (
                    <Plus className="h-3 w-3" />
                  )}
                </Button>
              )}
            </div>
            
            {canHaveCompositions && showAddComposition && availableTrailers.length > 0 && (
              <div className="mb-2">
                <Popover open={openComposition} onOpenChange={setOpenComposition}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full h-8 text-xs justify-between"
                    >
                      <span>Selecione um reboque</span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Buscar reboque..." />
                      <CommandList>
                        <CommandEmpty>Nenhum reboque disponível.</CommandEmpty>
                        <CommandGroup>
                          {availableTrailers.map((trailer) => (
                            <CommandItem
                              key={trailer.id}
                              value={`${trailer.plate} ${trailer.vehicleType} ${trailer.brand} ${trailer.model}`}
                              onSelect={() => {
                                handleAddComposition(vehicle.id, trailer.id);
                                setShowAddComposition(false);
                                setOpenComposition(false);
                              }}
                            >
                              <Check className="mr-2 h-4 w-4 opacity-0" />
                              <div className="flex flex-col gap-0.5">
                                <div className="font-semibold">
                                  {trailer.plate} - {trailer.vehicleType}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {trailer.brand} {trailer.model} | {trailer.axles} eixos
                                  {trailer.weight && ` | ${trailer.weight} ton`}
                                </div>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            )}
            
            {linkedTrailers.length > 0 ? (
              <div className="space-y-1.5">
                {linkedTrailers.map((trailer) => (
                  <div
                    key={trailer?.id}
                    className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
                  >
                    <div className="flex items-center gap-2">
                      <Link2 className="h-3 w-3 text-muted-foreground" />
                      <div>
                        <p className="text-xs font-medium">{trailer?.plate}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {trailer?.vehicleType} - {trailer?.axles} eixos
                          {trailer?.weight && ` - ${trailer.weight} ton`}
                        </p>
                      </div>
                    </div>
                    {vehicle.status !== 'sold' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() => handleRemoveComposition(vehicle.id, trailer!.plate)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
                <div className="mt-2 pt-2 border-t border-border/50">
                  <p className="text-xs text-muted-foreground">
                    Total de eixos: {vehicle.axles + (vehicle.compositionAxles?.reduce((sum, axles) => sum + axles, 0) || 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Peso do conjunto: {
                      (vehicle.weight || 0) + linkedTrailers.reduce((sum, trailer) => sum + (trailer?.weight || 0), 0) > 0
                        ? ((vehicle.weight || 0) + linkedTrailers.reduce((sum, trailer) => sum + (trailer?.weight || 0), 0)).toFixed(1) + ' ton'
                        : 'N/A'
                    }
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">
                <p>Nenhuma composição vinculada</p>
                <p className="mt-1">Total de eixos: {vehicle.axles}</p>
                <p className="mt-1">Peso: {vehicle.weight ? `${vehicle.weight} ton` : 'N/A'}</p>
              </div>
            )}
          </div>
        )}
        
        {isTrailerVehicle && (
          <div className="pt-3 border-t border-border">
            <span className="text-sm text-muted-foreground block mb-2">Vinculado a:</span>
            {linkedToTractionVehicles.length > 0 ? (
              <div className="space-y-1.5">
                {linkedToTractionVehicles.map((tractionVehicle) => (
                  <div
                    key={tractionVehicle.id}
                    className="flex items-center justify-between p-2 bg-primary/5 rounded-md border border-primary/10"
                  >
                    <div className="flex items-center gap-2">
                      <Link2 className="h-3 w-3 text-primary" />
                      <div>
                        <p className="text-xs font-medium">{tractionVehicle.plate}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {tractionVehicle.vehicleType} - {tractionVehicle.model}
                        </p>
                      </div>
                    </div>
                    {vehicle.status !== 'sold' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() => handleRemoveComposition(tractionVehicle.id, vehicle.plate)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Não vinculado a nenhum veículo de tração</p>
            )}
          </div>
        )}
        
        {!['Baú', 'Carreta', 'Graneleiro', 'Container', 'Caçamba', 'Baú Frigorífico', 'Sider', 'Prancha', 'Tanque', 'Cegonheiro', 'Rodotrem'].includes(vehicle.vehicleType) && (
          <div className="pt-3 border-t border-border">
            <span className="text-sm text-muted-foreground mb-2 block">Vincular Motorista:</span>
            <Popover open={openDriver} onOpenChange={setOpenDriver}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  disabled={vehicle.status === 'sold'}
                  className={cn(
                    "w-full justify-between",
                    !vehicle.driverId && "text-muted-foreground"
                  )}
                >
                  {vehicle.driverId
                    ? (() => {
                        const driver = allDrivers.find(d => d.id === vehicle.driverId);
                        return driver ? driver.name : "Sem motorista";
                      })()
                    : "Sem motorista"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[350px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Buscar motorista..." />
                  <CommandList>
                    <CommandEmpty>Nenhum motorista encontrado.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value="none"
                        onSelect={() => {
                          handleDriverChange(vehicle.id, 'none');
                          setOpenDriver(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            !vehicle.driverId ? "opacity-100" : "opacity-0"
                          )}
                        />
                        Sem motorista
                      </CommandItem>
                      {availableDrivers.map((driver) => (
                        <CommandItem
                          key={driver.id}
                          value={`${driver.name} ${driver.cpf}`}
                          onSelect={() => {
                            handleDriverChange(vehicle.id, driver.id);
                            setOpenDriver(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              driver.id === vehicle.driverId ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col gap-0.5">
                            <div className="font-semibold">
                              {driver.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              CPF: {driver.cpf}
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        )}

        {vehicle.status !== 'sold' && (
          <div className="pt-3 border-t border-border">
            <span className="text-sm text-muted-foreground mb-2 block">Alterar Status:</span>
            <Select
              value={vehicle.status}
              onValueChange={(value) => handleStatusChange(vehicle.id, vehicle.plate, value, vehicle.status)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="defective">Defeito</SelectItem>
                <SelectItem value="maintenance">Manutenção</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => handleViewDetails(vehicle)}
          >
            <Eye className="h-4 w-4 mr-2" />
            Detalhes
          </Button>
          {vehicle.status !== 'sold' ? (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(vehicle)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Editar</TooltipContent>
              </Tooltip>
              {isAdmin() && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSellVehicle(vehicle)}
                  >
                    <DollarSign className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Vender</TooltipContent>
              </Tooltip>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(vehicle)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Excluir</TooltipContent>
              </Tooltip>
            </>
          ) : isAdmin() ? (
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => handleReverseSale(vehicle)}
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Reverter Venda
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
    </TooltipProvider>
  );
}
