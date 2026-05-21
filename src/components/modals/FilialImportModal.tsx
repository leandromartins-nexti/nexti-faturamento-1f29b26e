import { useState } from 'react';
import { Button } from '@/ds';
import { Download, Upload, AlertCircle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import type { FilialFormValues } from './FilialFormModal';

interface FilialImportModalProps {
  open: boolean;
  onClose: () => void;
  onImport: (filiais: FilialFormValues[]) => void;
}

const CSV_HEADERS = [
  'document',
  'nomeFantasia',
  'razaoSocial',
  'email',
  'phone',
  'zipCode',
  'street',
  'number',
  'complement',
  'district',
  'city',
  'state',
  'inscricaoMunicipal',
  'inscricaoEstadual',
  'regimeTributario',
];

const CSV_TEMPLATE = [
  CSV_HEADERS.join(','),
  '12.345.678/0001-99,Nexti Rio,Nexti Tecnologia e Sistemas Ltda.,faturamento@nexti.com.br,(21) 3333-4444,20040020,Avenida Paulista,1000,Apto 100,Bela Vista,São Paulo,SP,12345-6,123.456.789,SIMPLES_NACIONAL',
  '98.765.432/0001-11,Nexti MG,Nexti Minas Gerais Ltda.,faturamento@nexti-mg.com.br,(31) 2222-3333,30130100,Avenida Getúlio Vargas,1500,,Funcionários,Belo Horizonte,MG,,123.456.788,LUCRO_PRESUMIDO',
].join('\n');

function parseCSV(csv: string): FilialFormValues[] {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) return [];

  const headerLine = lines[0];
  const headers = headerLine.split(',').map((h) => h.trim());

  const filiais: FilialFormValues[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = line.split(',').map((v) => v.trim());
    const filial: Record<string, string> = {};

    headers.forEach((header, idx) => {
      filial[header] = values[idx] ?? '';
    });

    filiais.push({
      document: filial.document ?? '',
      nomeFantasia: filial.nomeFantasia ?? '',
      razaoSocial: filial.razaoSocial ?? '',
      email: filial.email ?? '',
      phone: filial.phone ?? '',
      zipCode: filial.zipCode ?? '',
      street: filial.street ?? '',
      number: filial.number ?? '',
      complement: filial.complement ?? '',
      district: filial.district ?? '',
      city: filial.city ?? '',
      state: filial.state ?? '',
      inscricaoMunicipal: filial.inscricaoMunicipal ?? '',
      inscricaoEstadual: filial.inscricaoEstadual ?? '',
      regimeTributario: (filial.regimeTributario as any) ?? '',
    });
  }

  return filiais;
}

export function FilialImportModal({ open, onClose, onImport }: FilialImportModalProps) {
  const [step, setStep] = useState<'choose' | 'preview'>('choose');
  const [importData, setImportData] = useState<FilialFormValues[]>([]);
  const [error, setError] = useState('');

  function handleDownloadTemplate() {
    const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'filiais-template.csv');
    link.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError('');
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csv = event.target?.result as string;
        const filiais = parseCSV(csv);

        if (filiais.length === 0) {
          setError('Nenhuma filial encontrada no arquivo CSV.');
          return;
        }

        // Validação básica
        const erros = filiais
          .map((f, idx) => {
            const issues = [];
            if (!f.document.trim()) issues.push('CNPJ vazio');
            if (!f.nomeFantasia.trim()) issues.push('Nome fantasia vazio');
            if (!f.razaoSocial.trim()) issues.push('Razão social vazia');
            return issues.length > 0 ? `Linha ${idx + 2}: ${issues.join(', ')}` : null;
          })
          .filter(Boolean);

        if (erros.length > 0) {
          setError(`Erros encontrados:\n${erros.join('\n')}`);
          return;
        }

        setImportData(filiais);
        setStep('preview');
      } catch (err) {
        setError(`Erro ao processar arquivo: ${err instanceof Error ? err.message : 'desconhecido'}`);
      }
    };
    reader.readAsText(file);
  }

  function handleConfirmImport() {
    onImport(importData);
    handleClose();
  }

  function handleClose() {
    setStep('choose');
    setImportData([]);
    setError('');
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Importar filiais"
      size="lg"
    >
      <div className="space-y-4">
        {step === 'choose' ? (
          <>
            <div className="space-y-4">
              <button
                onClick={handleDownloadTemplate}
                className="w-full p-4 border-2 border-dashed border-brand rounded-lg hover:bg-brand-bg transition-colors flex items-center justify-center gap-2 text-brand font-medium"
              >
                <Download className="size-5" />
                Baixar modelo CSV
              </button>

              <div className="relative">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  disabled={step !== 'choose'}
                />
                <button
                  className="w-full p-4 border-2 border-dashed border-ink-300 rounded-lg hover:bg-ink-50 transition-colors flex items-center justify-center gap-2 text-ink-600 font-medium"
                  onClick={(e) => {
                    const input = e.currentTarget.parentElement?.querySelector('input[type="file"]') as HTMLInputElement;
                    input?.click();
                  }}
                >
                  <Upload className="size-5" />
                  Importar arquivo CSV
                </button>
              </div>

              {error && (
                <div className="p-3 bg-danger-bg rounded-lg flex gap-2 text-sm text-danger">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <pre className="whitespace-pre-wrap text-xs">{error}</pre>
                </div>
              )}

              <p className="text-xs text-ink-500">
                Clique em "Baixar modelo CSV" para obter um arquivo com os campos esperados, preenchido com exemplos.
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              <p className="text-sm font-medium text-ink-600">
                {importData.length} filial{importData.length !== 1 ? 's' : ''} será{importData.length !== 1 ? 'ão' : ''} importada{importData.length !== 1 ? 's' : ''}:
              </p>
              {importData.map((f, idx) => (
                <div key={idx} className="p-2 bg-ink-50 rounded text-xs">
                  <div className="font-medium text-ink-700">{f.nomeFantasia}</div>
                  <div className="text-ink-500">{f.document}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-ink-100">
        <Button variant="outline" size="sm" onClick={handleClose}>
          Cancelar
        </Button>
        {step === 'preview' && (
          <Button
            size="sm"
            onClick={() => {
              setStep('choose');
              setImportData([]);
            }}
          >
            Voltar
          </Button>
        )}
        {step === 'preview' && (
          <Button size="sm" onClick={handleConfirmImport}>
            Importar {importData.length} filial{importData.length !== 1 ? 's' : ''}
          </Button>
        )}
      </div>
    </Modal>
  );
}
