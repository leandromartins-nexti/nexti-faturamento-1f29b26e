import { useState } from 'react';
import { Button } from '@/ds';
import {
  Building2,
  Download,
  Edit3,
  FileText,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Receipt,
  Trash2,
} from 'lucide-react';
import { Card, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { FilialFormModal } from '../components/modals/FilialFormModal';
import { FilialImportModal } from '../components/modals/FilialImportModal';
import { useContratos } from '../hooks/useContratos';
import { useFiliais } from '../hooks/useFiliais';
import { useUser } from '../nexti-sdk';
import type { Filial, RegimeTributario } from '../lib/types';

const REGIME_LABEL: Record<RegimeTributario, string> = {
  SIMPLES_NACIONAL: 'Simples Nacional',
  LUCRO_PRESUMIDO: 'Lucro Presumido',
  LUCRO_REAL: 'Lucro Real',
};

const REGIME_TONE: Record<RegimeTributario, 'success' | 'info' | 'brand'> = {
  SIMPLES_NACIONAL: 'success',
  LUCRO_PRESUMIDO: 'info',
  LUCRO_REAL: 'brand',
};

export function FilialsList() {
  const user = useUser();
  const { contratos } = useContratos();
  const { filiais, loading, error, addFilial, updateFilial, removeFilial, importFiliais } = useFiliais();
  const [modalOpen, setModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [editing, setEditing] = useState<Filial | undefined>(undefined);
  const [saving, setSaving] = useState(false);

  function handleEdit(f: Filial) {
    setEditing(f);
    setModalOpen(true);
  }

  function handleNew() {
    setEditing(undefined);
    setModalOpen(true);
  }

  async function handleRemove(f: Filial) {
    const vinculados = contratos.filter((c) => c.filialId === f.id).length;
    if (vinculados > 0) {
      alert(`Não é possível remover: ${vinculados} contrato(s) vinculado(s) a esta filial.`);
      return;
    }
    if (confirm(`Remover filial "${f.nomeFantasia}"?`)) {
      await removeFilial(f.id);
    }
  }

  if (!user) {
    return (
      <div className="p-6 flex items-center gap-2 text-ink-500">
        <Loader2 className="size-4 animate-spin" /> Carregando…
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      {error && (
        <div className="text-sm text-danger bg-danger-bg border border-danger rounded-md px-3 py-2">{error}</div>
      )}

      <div className="flex items-center justify-between">
        <div className="text-sm text-ink-500">
          {loading ? (
            <span className="flex items-center gap-1.5"><Loader2 className="size-3.5 animate-spin" /> Carregando…</span>
          ) : (
            <>{filiais.length} filial{filiais.length !== 1 ? 'is' : ''} cadastrada{filiais.length !== 1 ? 's' : ''}</>
          )}
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" leftIcon={<Download className="size-4" />} onClick={() => setImportModalOpen(true)}>
            Importar
          </Button>
          <Button size="sm" leftIcon={<Plus className="size-4" />} onClick={handleNew}>
            Nova filial
          </Button>
        </div>
      </div>

      {filiais.length === 0 ? (
        <Card>
          <CardBody className="py-16 text-center">
            <Building2 className="size-10 text-ink-300 mx-auto mb-3" />
            <div className="font-bold text-navy-700">Nenhuma filial cadastrada</div>
            <p className="text-sm text-ink-500 mt-1">Crie a primeira filial para emitir contratos.</p>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filiais.map((f) => {
            const cts = contratos.filter((c) => c.filialId === f.id);
            const temEndereco = f.city || f.street;
            return (
              <Card key={f.id} className="hover:shadow-sm transition-shadow">
                <CardBody>
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-md bg-navy-50 text-navy-700 flex items-center justify-center shrink-0">
                        <Building2 className="size-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-navy-700 truncate">{f.nomeFantasia}</div>
                        <div className="text-xs text-ink-500 truncate">{f.razaoSocial}</div>
                        <div className="text-xs text-ink-400 mt-0.5">{f.document}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleEdit(f)}
                        className="p-1.5 text-ink-400 hover:text-ink-600 hover:bg-ink-100 rounded-sm"
                        aria-label="Editar filial"
                      >
                        <Edit3 className="size-4" />
                      </button>
                      <button
                        onClick={() => handleRemove(f)}
                        className="p-1.5 text-ink-400 hover:text-danger hover:bg-danger-bg rounded-sm"
                        aria-label="Remover filial"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>

                  {/* Contatos */}
                  {(f.email || f.phone) && (
                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-ink-600">
                      {f.email && (
                        <span className="flex items-center gap-1.5">
                          <Mail className="size-3.5 text-ink-400" />
                          {f.email}
                        </span>
                      )}
                      {f.phone && (
                        <span className="flex items-center gap-1.5">
                          <Phone className="size-3.5 text-ink-400" />
                          {f.phone}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Endereço */}
                  {temEndereco && (
                    <div className="mt-2 flex items-start gap-1.5 text-xs text-ink-600">
                      <MapPin className="size-3.5 text-ink-400 mt-0.5 shrink-0" />
                      <span>
                        {[f.street, f.number, f.complement].filter(Boolean).join(', ')}
                        {(f.district || f.city) && (
                          <> · {[f.district, f.city, f.state].filter(Boolean).join(' — ')}</>
                        )}
                        {f.zipCode && <> · CEP {f.zipCode}</>}
                      </span>
                    </div>
                  )}

                  {/* Rodapé */}
                  <div className="mt-4 pt-3 border-t border-ink-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1.5 text-xs text-ink-500">
                        <FileText className="size-3.5" />
                        {cts.length} contrato{cts.length !== 1 ? 's' : ''}
                      </span>
                      {f.regimeTributario && (
                        <Badge tone={REGIME_TONE[f.regimeTributario]}>
                          {REGIME_LABEL[f.regimeTributario]}
                        </Badge>
                      )}
                    </div>
                    {(f.inscricaoMunicipal || f.inscricaoEstadual) && (
                      <div className="flex items-center gap-1.5 text-xs text-ink-500">
                        <Receipt className="size-3.5" />
                        {f.inscricaoMunicipal && <span>IM {f.inscricaoMunicipal}</span>}
                        {f.inscricaoMunicipal && f.inscricaoEstadual && <span>·</span>}
                        {f.inscricaoEstadual && <span>IE {f.inscricaoEstadual}</span>}
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      <FilialFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setSaving(false); }}
        filial={editing}
        onSave={async (values) => {
          setSaving(true);
          if (editing) {
            await updateFilial(editing.id, values);
          } else {
            await addFilial(values);
          }
          setSaving(false);
          setModalOpen(false);
        }}
      />

      <FilialImportModal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImport={async (rows) => {
          await importFiliais(rows);
          setImportModalOpen(false);
        }}
      />
    </div>
  );
}
