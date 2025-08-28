import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { unparse } from 'papaparse';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const exportType = searchParams.get('type') || 'contributions';

    let csvData: any[] = [];
    let filename = 'export.csv';

    if (exportType === 'contributions') {
      const { data } = await supabase
        .from('profiles')
        .select(`
          full_name,
          email,
          role,
          total_submissions,
          total_published,
          created_at
        `)
        .order('total_published', { ascending: false });

      csvData = data?.map(user => ({
        'Full Name': user.full_name || 'N/A',
        'Email': user.email,
        'Role': user.role,
        'Total Submissions': user.total_submissions,
        'Total Published': user.total_published,
        'Joined Date': new Date(user.created_at).toLocaleDateString(),
      })) || [];

      filename = `contributions_${new Date().toISOString().split('T')[0]}.csv`;
    } else if (exportType === 'submissions') {
      const { data } = await supabase
        .from('submissions')
        .select(`
          title,
          status,
          link_type,
          youtube_view_count,
          youtube_like_count,
          created_at,
          published_at,
          profiles (full_name, email)
        `)
        .order('created_at', { ascending: false });

      csvData = data?.map(submission => ({
        'Title': submission.title,
        'Status': submission.status,
        'Type': submission.link_type,
        'Submitter': submission.profiles?.full_name || submission.profiles?.email || 'Unknown',
        'Views': submission.youtube_view_count || 0,
        'Likes': submission.youtube_like_count || 0,
        'Created': new Date(submission.created_at).toLocaleDateString(),
        'Published': submission.published_at ? new Date(submission.published_at).toLocaleDateString() : 'N/A',
      })) || [];

      filename = `submissions_${new Date().toISOString().split('T')[0]}.csv`;
    }

    const csv = unparse(csvData);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}