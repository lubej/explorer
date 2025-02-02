import { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import { BarChart } from '../../components/charts/BarChart'
import { Layer, useGetLayerStatsTxVolume } from '../../../oasis-indexer/api'
import {
  chartUseQueryStaleTimeMs,
  durationToQueryParams,
  getMonthlyBucketsDailyAverage,
} from '../../utils/chart-utils'
import { DurationPills } from './DurationPills'
import { CardHeaderWithResponsiveActions } from './CardHeaderWithResponsiveActions'
import { ChartDuration } from '../../utils/chart-utils'

export const TransactionsStats: FC = () => {
  const { t } = useTranslation()
  const [chartDuration, setChartDuration] = useState<ChartDuration>(ChartDuration.MONTH)
  const statsParams = durationToQueryParams[chartDuration]
  const dailyVolumeQuery = useGetLayerStatsTxVolume(Layer.emerald, statsParams, {
    query: {
      keepPreviousData: true,
      staleTime: chartUseQueryStaleTimeMs,
    },
  })
  const buckets =
    dailyVolumeQuery.isFetched && chartDuration === ChartDuration.ALL_TIME
      ? getMonthlyBucketsDailyAverage(dailyVolumeQuery.data?.data.buckets)
      : dailyVolumeQuery.data?.data.buckets

  return (
    <Card>
      <CardHeaderWithResponsiveActions
        action={<DurationPills handleChange={setChartDuration} value={chartDuration} />}
        disableTypography
        component="h3"
        title={t('transactionStats.header')}
      />
      <CardContent sx={{ height: 450 }}>
        {buckets && (
          <BarChart
            barSize={chartDuration === ChartDuration.WEEK ? 125 : undefined}
            barRadius={chartDuration === ChartDuration.WEEK ? 20 : undefined}
            cartesianGrid
            data={buckets.slice().reverse()}
            dataKey="tx_volume"
            formatters={{
              data: (value: number) => t('transactionStats.tooltip', { value }),
              label: (value: string) =>
                t('common.formattedDateTime', {
                  timestamp: new Date(value),
                }),
            }}
            withLabels
          />
        )}
      </CardContent>
    </Card>
  )
}
