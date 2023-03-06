import { Link as RouterLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import formatDistanceStrict from 'date-fns/formatDistanceStrict'
import { RuntimeBlock } from '../../../oasis-indexer/api'
import { VerticalProgressBar } from '../../components/ProgressBar'
import { Table, TableCellAlign, TableColProps } from '../../components/Table'
import { TrimLinkLabel } from '../../components/TrimLinkLabel'
import { RouteUtils } from '../../utils/route-utils'
import { gasLimit } from '../../../config'
import { TablePaginationProps } from '../Table/TablePagination'
import { useLayer } from '../../hooks/useLayer'

export type TableRuntimeBlock = RuntimeBlock & {
  markAsNew?: boolean
}

export type TableRuntimeBlockList = {
  blocks: TableRuntimeBlock[]
}

type BlocksProps = {
  blocks?: TableRuntimeBlock[]
  isLoading: boolean
  limit: number
  verbose?: boolean
  pagination: false | TablePaginationProps
}

export const Blocks = (props: BlocksProps) => {
  const { isLoading, blocks, verbose, pagination, limit } = props
  const { t } = useTranslation()
  const layer = useLayer()

  const tableColumns: TableColProps[] = [
    { content: t('common.fill') },
    { content: t('common.block'), align: TableCellAlign.Right },
    { content: t('common.age'), align: TableCellAlign.Right },
    { content: t('common.transactions'), align: TableCellAlign.Right },
    ...(verbose ? [{ content: t('common.hash') }] : []),
    { content: t('common.size'), align: TableCellAlign.Right },
    ...(verbose ? [{ content: t('common.gasUsed'), align: TableCellAlign.Right }] : []),
    ...(verbose ? [{ content: t('common.gasLimit'), align: TableCellAlign.Right }] : []),
  ]

  const tableRows = blocks?.map(block => ({
    key: block.hash,
    data: [
      {
        content: <VerticalProgressBar variant="determinate" value={(100 * block.gas_used) / gasLimit} />,
        key: 'fill',
      },
      {
        align: TableCellAlign.Right,
        content: (
          <Typography variant="mono">
            <Link component={RouterLink} to={RouteUtils.getBlockRoute(block.round, layer)}>
              {block.round.toLocaleString()}
            </Link>
          </Typography>
        ),
        key: 'block',
      },
      {
        align: TableCellAlign.Right,
        content: formatDistanceStrict(new Date(block.timestamp), new Date(), {
          addSuffix: true,
        }),
        key: 'timestamp',
      },
      {
        align: TableCellAlign.Right,
        content: block.num_transactions,
        key: 'txs',
      },
      ...(verbose
        ? [
            {
              content: (
                <Typography variant="mono">
                  <TrimLinkLabel label={block.hash} to={RouteUtils.getBlockRoute(block.round, layer)} />
                </Typography>
              ),
              key: 'hash',
            },
          ]
        : []),
      {
        align: TableCellAlign.Right,
        content: t('common.bytes', {
          value: block.size,
          formatParams: {
            value: {
              style: 'unit',
              unit: 'byte',
              unitDisplay: 'long',
            } satisfies Intl.NumberFormatOptions,
          },
        }),
        key: 'size',
      },
      ...(verbose
        ? [
            {
              align: TableCellAlign.Right,
              content: block.gas_used.toLocaleString(),
              key: 'gasUsed',
            },
          ]
        : []),
      ...(verbose
        ? [
            {
              align: TableCellAlign.Right,
              content: gasLimit.toLocaleString(),
              key: 'gasLimit',
            },
          ]
        : []),
    ],
    highlight: block.markAsNew,
  }))

  return (
    <Table
      columns={tableColumns}
      rows={tableRows}
      rowsNumber={limit}
      name={t('blocks.latest')}
      isLoading={isLoading}
      pagination={pagination}
    />
  )
}
