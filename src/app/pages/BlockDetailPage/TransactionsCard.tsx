import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'

import { useSearchParamsPagination } from '../../components/Table/useSearchParamsPagination'
import { NUMBER_OF_ITEMS_ON_SEPARATE_PAGE } from '../../config'
import { useGetEmeraldTransactions } from '../../../oasis-indexer/api'
import { Transactions } from '../../components/Transactions'
import { PaginationError } from '../../components/Table/PaginationError'

const TransactionsList: FC<{ blockHeight: number }> = ({ blockHeight }) => {
  const txsPagination = useSearchParamsPagination('page')
  if (!txsPagination.valid) return <PaginationError light={true} />
  const txsOffset = (txsPagination.selectedPage - 1) * NUMBER_OF_ITEMS_ON_SEPARATE_PAGE
  const transactionsQuery = useGetEmeraldTransactions({
    block: blockHeight,
    limit: NUMBER_OF_ITEMS_ON_SEPARATE_PAGE,
    offset: txsOffset,
  })
  return (
    <Transactions
      transactions={transactionsQuery.data?.data.transactions}
      isLoading={transactionsQuery.isLoading}
      limit={NUMBER_OF_ITEMS_ON_SEPARATE_PAGE}
      pagination={{
        selectedPage: txsPagination.selectedPage,
        linkToPage: txsPagination.linkToPage,
      }}
    />
  )
}

export const TransactionsCard: FC<{ blockHeight: number }> = ({ blockHeight }) => {
  const { t } = useTranslation()
  return (
    <Card>
      <CardHeader disableTypography component="h3" title={t('common.transactions')} />
      <CardContent>
        <TransactionsList blockHeight={blockHeight} />
      </CardContent>
    </Card>
  )
}
