import { FC } from 'react'
import { Link as RouterLink, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  RuntimeTransaction,
  TransactionError,
  useGetEmeraldTransactionsTxHash,
} from '../../../oasis-indexer/api'
import { StyledDescriptionList } from '../../components/StyledDescriptionList'
import { PageLayout } from '../../components/PageLayout'
import { SubPageCard } from '../../components/SubPageCard'
import { TransactionStatusIcon } from '../../components/TransactionStatusIcon'
import { RuntimeTransactionLabel } from '../../components/RuntimeTransactionLabel'
import { Layer } from '../../../config'
import { RouteUtils } from '../../utils/route-utils'
import Link from '@mui/material/Link'
import { useFormattedTimestampString } from '../../hooks/useFormattedTimestamp'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { AccountLink } from '../../components/Account/AccountLink'
import Alert from '@mui/material/Alert'
import { styled } from '@mui/material/styles'
import { trimLongString } from '../../utils/trimLongString'
import { CopyToClipboard } from '../../components/CopyToClipboard'
import { AppErrors } from '../../../types/errors'
import { TextSkeleton } from '../../components/Skeleton'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { COLORS } from '../../../styles/theme/colors'

type TransactionSelectionResult = {
  wantedTransaction?: RuntimeTransaction
  warningMultipleTransactionsSameHash?: boolean
}

/**
 * Find the wanted transaction, in case there are more.
 *
 * Normally we want the successful one. If there is none, then the latest.
 */
function useWantedTransaction(transactions: RuntimeTransaction[]): TransactionSelectionResult {
  if (!transactions.length) {
    // Loading or error
    return {}
  } else if (transactions.length === 1) {
    return {
      wantedTransaction: transactions[0],
    }
  } else {
    const successfulOne = transactions.find(transaction => transaction.success)
    const latestOne = transactions.sort((a, b) => b.round - a.round)[0]
    return {
      warningMultipleTransactionsSameHash: true,
      wantedTransaction: successfulOne ?? latestOne,
    }
  }
}

const StyledAlert = styled(Alert)(() => ({
  marginBottom: '1em',
}))

const ErrorBox = styled(Box)(() => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '28px',
  fontSize: '15px',
  backgroundColor: COLORS.grayLight,
  color: COLORS.errorIndicatorBackground,
  borderRadius: 10,
  paddingLeft: 12,
  paddingRight: 12,
}))

export const TransactionDetailPage: FC = () => {
  const { t } = useTranslation()
  const hash = useParams().hash!
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const { isLoading, data } = useGetEmeraldTransactionsTxHash(hash)

  const transactions = data?.data ? [data.data] : [] // TODO: simplify this when the API is updated to return a list
  const { wantedTransaction: transaction, warningMultipleTransactionsSameHash } =
    useWantedTransaction(transactions)
  const formattedTimestamp = useFormattedTimestampString(transaction?.timestamp)

  if (!transaction && !isLoading) {
    throw AppErrors.NotFoundTxHash
  }

  const error: TransactionError | undefined = transaction?.success
    ? undefined
    : {
        // TODO: this is placeholder until we can get the data from the API
        code: 42,
        module: 'evm',
        message: 'reverted: missing error message',
      }

  return (
    <PageLayout>
      {warningMultipleTransactionsSameHash && (
        <StyledAlert severity={'error'}>{t('transaction.warningMultipleTransactionsSameHash')}</StyledAlert>
      )}
      {isLoading && (
        <SubPageCard title={t('transaction.header')}>
          <TextSkeleton numberOfRows={10} />
        </SubPageCard>
      )}
      {transaction && (
        <SubPageCard
          featured
          title={t('transaction.header')}
          key={`${transaction.round}_${transaction.index}`}
        >
          <StyledDescriptionList titleWidth={isMobile ? '100px' : '200px'}>
            <dt>{t('common.hash')}</dt>
            <dd>
              <Typography variant="mono" component="span" sx={{ color: COLORS.brandDark, fontWeight: 700 }}>
                {isMobile ? trimLongString(transaction.hash) : transaction.hash}
              </Typography>
              <CopyToClipboard value={transaction.hash} label={' '} />
            </dd>

            <dt>{t('common.status')}</dt>
            <dd style={{ flexWrap: 'wrap', gap: '10px' }}>
              <TransactionStatusIcon success={transaction.success} withText={true} />
              {error && (
                <ErrorBox>
                  {error.message} (error code {error.code})
                </ErrorBox>
              )}
            </dd>

            <dt>{t('common.block')}</dt>
            <dd>
              <Typography variant="mono" component="span" sx={{ color: COLORS.brandDark, fontWeight: 700 }}>
                <Link component={RouterLink} to={RouteUtils.getBlockRoute(transaction.round, Layer.Emerald)}>
                  {transaction.round.toLocaleString()}
                </Link>
              </Typography>
            </dd>

            <dt>{t('common.type')}</dt>
            <dd>
              <RuntimeTransactionLabel method={transaction.method} />
            </dd>

            <dt>{t('common.timestamp')}</dt>
            <dd>{formattedTimestamp}</dd>

            <dt>{t('common.from')}</dt>
            <dd>
              <Typography variant="mono" component="span" sx={{ color: COLORS.brandDark, fontWeight: 700 }}>
                <AccountLink address={transaction.sender_0} paratime={Layer.Emerald} />
              </Typography>
              <CopyToClipboard value={transaction.sender_0} label={' '} />
            </dd>

            {transaction.to && (
              <>
                <dt>{t('common.to')}</dt>
                <dd>
                  <Typography
                    variant="mono"
                    component="span"
                    sx={{ color: COLORS.brandDark, fontWeight: 700 }}
                  >
                    <AccountLink address={transaction.to} paratime={Layer.Emerald} />
                  </Typography>
                  <CopyToClipboard value={transaction.to} label={' '} />
                </dd>
              </>
            )}

            <dt>{t('common.value')}</dt>
            <dd>{t('common.valueInRose', { value: transaction.amount })}</dd>

            <dt>{t('common.txnFee')}</dt>
            <dd>{t('common.valueInRose', { value: transaction.fee })}</dd>

            <dt>{t('common.gasLimit')}</dt>
            <dd>{t('common.valueInRose', { value: transaction.gas_limit })}</dd>
          </StyledDescriptionList>
        </SubPageCard>
      )}
    </PageLayout>
  )
}
